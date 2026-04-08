import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarketStateService } from '../../core/services/market-state.service';
import { LargeNumberPipe } from '../../shared/pipes/large-number.pipe';
import { PercentChangePipe } from '../../shared/pipes/percent-change.pipe';

@Component({
  selector: 'gmt-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LargeNumberPipe, PercentChangePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      <div class="header__stats">
        @if (marketState.globalData(); as global) {
          <div class="stat">
            <span class="stat__label">Market Cap</span>
            <span class="stat__value">
              {{ global.data.total_market_cap['usd'] | largeNumber }}
            </span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat__label">24h Volume</span>
            <span class="stat__value">
              {{ global.data.total_volume['usd'] | largeNumber }}
            </span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat__label">BTC Dominance</span>
            <span class="stat__value">
              {{ global.data.market_cap_percentage['btc'] | number: '1.1-1' }}%
            </span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat__label">24h Change</span>
            <span
              class="stat__value"
              [class.positive]="global.data.market_cap_change_percentage_24h_usd >= 0"
              [class.negative]="global.data.market_cap_change_percentage_24h_usd < 0"
            >
              {{ global.data.market_cap_change_percentage_24h_usd | percentChange }}
            </span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat__label">Active Cryptos</span>
            <span class="stat__value">
              {{ global.data.active_cryptocurrencies | number }}
            </span>
          </div>
        } @else {
          <div class="stats-loading">Loading global data...</div>
        }
      </div>

      <div class="header__actions">
        <div class="live-indicator">
          <span class="pulse-dot"></span>
          <span>LIVE</span>
        </div>

        @if (marketState.lastUpdated(); as updated) {
          <span class="last-updated">
            Updated {{ updated | date: 'HH:mm:ss' }}
          </span>
        }

        <button
          class="refresh-btn"
          (click)="marketState.refresh()"
          [disabled]="marketState.isLoading()"
          title="Refresh data"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [class.spinning]="marketState.isLoading()"
          >
            <path d="M1 4v6h6"/>
            <path d="M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </button>

        <div class="currency-selector">
          <select
            [value]="marketState.selectedCurrency()"
            (change)="onCurrencyChange($event)"
          >
            @for (c of currencies; track c.value) {
              <option [value]="c.value">{{ c.label }}</option>
            }
          </select>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      height: 52px;
      background: var(--surface-1);
      border-bottom: 1px solid var(--border);
      gap: 16px;
      flex-shrink: 0;
    }

    .header__stats {
      display: flex;
      align-items: center;
      gap: 0;
      overflow-x: auto;
      scrollbar-width: none;
      flex: 1;
    }

    .header__stats::-webkit-scrollbar { display: none; }

    .stat {
      display: flex;
      flex-direction: column;
      padding: 0 16px;
    }

    .stat__label {
      font-size: 0.65rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }

    .stat__value {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    .stat__value.positive { color: var(--green); }
    .stat__value.negative { color: var(--red); }

    .stat-divider {
      width: 1px;
      height: 24px;
      background: var(--border);
      flex-shrink: 0;
    }

    .stats-loading {
      font-size: 0.8rem;
      color: var(--text-muted);
      padding: 0 16px;
    }

    .header__actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--green);
      letter-spacing: 0.1em;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--green);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    .last-updated {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }

    .refresh-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all 0.15s;
    }

    .refresh-btn:hover:not(:disabled) {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }

    .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .refresh-btn svg {
      width: 14px;
      height: 14px;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .spinning { animation: spin 1s linear infinite; }

    .currency-selector select {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-primary);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      outline: none;
    }

    .currency-selector select:focus {
      border-color: var(--accent);
    }

    @media (max-width: 768px) {
      .header { padding: 0 16px; }
      .stat { padding: 0 10px; }
      .last-updated { display: none; }
    }
  `],
})
export class HeaderComponent {
  readonly marketState = inject(MarketStateService);

  readonly currencies = [
    { value: 'usd', label: '$ USD' },
    { value: 'eur', label: '€ EUR' },
    { value: 'gbp', label: '£ GBP' },
    { value: 'btc', label: '₿ BTC' },
  ];

  onCurrencyChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.marketState.setCurrency(value);
  }
}
