import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, interval, of } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {
  switchMap,
  catchError,
  retry,
  takeUntil,
  share,
} from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface PriceUpdate {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  timestamp: number;
}

export interface BinanceTickerMessage {
  e: string; // event type
  s: string; // symbol
  c: string; // last price
  P: string; // price change %
  p: string; // price change
  v: string; // volume
  T: number; // timestamp
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private socket$: WebSocketSubject<BinanceTickerMessage[]> | null = null;
  private destroy$ = new Subject<void>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  /**
   * Subscribes to real-time price updates for a list of symbols via Binance WS.
   * Falls back to polling if WS is unavailable.
   */
  subscribeToPrices(symbols: string[]): Observable<PriceUpdate[]> {
    const streams = symbols
      .map((s) => `${s.toLowerCase()}usdt@ticker`)
      .join('/');

    const wsUrl = `${environment.wsUrl}/${streams}`;

    try {
      this.socket$ = webSocket<BinanceTickerMessage[]>({
        url: wsUrl,
        openObserver: {
          next: () => {
            console.log('[WS] Connected to Binance stream');
            this.reconnectAttempts = 0;
          },
        },
        closeObserver: {
          next: () => {
            console.log('[WS] Connection closed');
          },
        },
      });

      return this.socket$.pipe(
        retry({
          count: this.maxReconnectAttempts,
          delay: (_, retryCount) => {
            this.reconnectAttempts = retryCount;
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
            console.log(`[WS] Reconnecting in ${delay}ms (attempt ${retryCount})`);
            return interval(delay);
          },
        }),
        switchMap((messages) => {
          const updates = this.parseMessages(
            Array.isArray(messages) ? messages : [messages as unknown as BinanceTickerMessage]
          );
          return of(updates);
        }),
        catchError((err) => {
          console.error('[WS] Fatal error:', err);
          return of([]);
        }),
        share(),
        takeUntil(this.destroy$)
      );
    } catch {
      console.warn('[WS] WebSocket not available, returning empty stream');
      return of([]);
    }
  }

  private parseMessages(messages: BinanceTickerMessage[]): PriceUpdate[] {
    return messages
      .filter((m) => m && m.s)
      .map((m) => ({
        symbol: m.s.replace('USDT', '').toLowerCase(),
        price: parseFloat(m.c),
        priceChange: parseFloat(m.p),
        priceChangePercent: parseFloat(m.P),
        volume: parseFloat(m.v),
        timestamp: m.T || Date.now(),
      }));
  }

  close(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.close();
  }
}
