import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  Asset,
  AssetDetail,
  AssetChartData,
  MarketGlobal,
  MarketFilter,
} from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class CoinGeckoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getMarkets(filter: Partial<MarketFilter> = {}): Observable<Asset[]> {
    const {
      currency = 'usd',
      page = 1,
      perPage = 50,
      sortField = 'market_cap_rank',
      sortDirection = 'asc',
    } = filter;

    const params = new HttpParams()
      .set('vs_currency', currency)
      .set('order', this.buildSortOrder(sortField, sortDirection))
      .set('per_page', perPage.toString())
      .set('page', page.toString())
      .set('sparkline', 'true')
      .set('price_change_percentage', '7d,30d');

    return this.http
      .get<Asset[]>(`${this.baseUrl}/coins/markets`, { params })
      .pipe(retry(2), catchError(this.handleError));
  }

  getAssetDetail(id: string): Observable<AssetDetail> {
    const params = new HttpParams()
      .set('localization', 'false')
      .set('tickers', 'false')
      .set('market_data', 'true')
      .set('community_data', 'false')
      .set('developer_data', 'false')
      .set('sparkline', 'false');

    return this.http
      .get<AssetDetail>(`${this.baseUrl}/coins/${id}`, { params })
      .pipe(retry(2), catchError(this.handleError));
  }

  getAssetChart(
    id: string,
    currency: string = 'usd',
    days: number = 30
  ): Observable<AssetChartData> {
    const params = new HttpParams()
      .set('vs_currency', currency)
      .set('days', days.toString())
      .set('interval', days <= 1 ? 'hourly' : 'daily');

    return this.http
      .get<AssetChartData>(`${this.baseUrl}/coins/${id}/market_chart`, {
        params,
      })
      .pipe(retry(2), catchError(this.handleError));
  }

  getGlobalData(): Observable<MarketGlobal> {
    return this.http
      .get<MarketGlobal>(`${this.baseUrl}/global`)
      .pipe(retry(2), catchError(this.handleError));
  }

  searchAssets(query: string): Observable<Asset[]> {
    return this.getMarkets({ perPage: 250 }).pipe(
      map((assets) =>
        assets.filter(
          (a) =>
            a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.symbol.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  private buildSortOrder(
    field: string,
    direction: 'asc' | 'desc'
  ): string {
    const fieldMap: Record<string, string> = {
      market_cap_rank: 'market_cap',
      current_price: 'market_cap',
      price_change_percentage_24h: 'market_cap',
      market_cap: 'market_cap',
      total_volume: 'volume',
    };

    const apiField = fieldMap[field] || 'market_cap';
    return `${apiField}_${direction}`;
  }

  private handleError(error: { status: number; message: string }): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 429) {
      errorMessage =
        'Rate limit exceeded. Please wait a moment before refreshing.';
    } else if (error.status === 404) {
      errorMessage = 'Asset not found.';
    } else if (error.status === 0) {
      errorMessage =
        'Unable to connect. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({ status: error.status, message: errorMessage }));
  }
}
