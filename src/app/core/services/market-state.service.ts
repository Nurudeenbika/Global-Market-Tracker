import { Injectable, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  interval,
  combineLatest,
  EMPTY,
  of,
} from 'rxjs';
import {
  switchMap,
  tap,
  catchError,
  debounceTime,
  distinctUntilChanged,
  startWith,
  shareReplay,
} from 'rxjs/operators';
import { CoinGeckoService } from './coin-gecko.service';
import { WatchlistService } from './watchlist.service';
import {
  Asset,
  MarketFilter,
  FilterCategory,
  SortField,
  SortDirection,
  MarketGlobal,
} from '../models/asset.model';
import { LoadingState } from '../models/api-response.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class MarketStateService {
  private readonly coinGecko = inject(CoinGeckoService);
  private readonly watchlistService = inject(WatchlistService);

  // State signals
  readonly assets = signal<Asset[]>([]);
  readonly globalData = signal<MarketGlobal | null>(null);
  readonly loadingState = signal<LoadingState>('idle');
  readonly error = signal<string | null>(null);
  readonly lastUpdated = signal<Date | null>(null);
  readonly selectedCurrency = signal<string>('usd');

  // Filter signals
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<FilterCategory>('all');
  readonly sortField = signal<SortField>('market_cap_rank');
  readonly sortDirection = signal<SortDirection>('asc');

  // Computed filtered assets
  readonly filteredAssets = computed(() => {
    const assets = this.assets();
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();
    const field = this.sortField();
    const direction = this.sortDirection();
    const watchlistIds = this.watchlistService.ids();

    let filtered = [...assets];

    // Search filter
    if (query) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.symbol.toLowerCase().includes(query)
      );
    }

    // Category filter
    switch (category) {
      case 'top_gainers':
        filtered = filtered
          .filter((a) => a.price_change_percentage_24h > 0)
          .sort(
            (a, b) =>
              b.price_change_percentage_24h - a.price_change_percentage_24h
          );
        break;
      case 'top_losers':
        filtered = filtered
          .filter((a) => a.price_change_percentage_24h < 0)
          .sort(
            (a, b) =>
              a.price_change_percentage_24h - b.price_change_percentage_24h
          );
        break;
      case 'watchlist':
        filtered = filtered.filter((a) => watchlistIds.has(a.id));
        break;
    }

    // Sort
    if (category !== 'top_gainers' && category !== 'top_losers') {
      filtered = this.applySorting(filtered, field, direction);
    }

    return filtered;
  });

  readonly isLoading = computed(() => this.loadingState() === 'loading');

  private readonly refresh$ = new Subject<void>();

  constructor() {
    this.startAutoRefresh();
    this.loadGlobalData();
  }

  loadAssets(): void {
    this.loadingState.set('loading');
    this.error.set(null);

    this.coinGecko
      .getMarkets({
        currency: this.selectedCurrency(),
        perPage: 100,
        page: 1,
      })
      .pipe(
        catchError((err) => {
          this.loadingState.set('error');
          this.error.set(err.message || 'Failed to load market data');
          return of([]);
        })
      )
      .subscribe((assets) => {
        if (assets.length) {
          this.assets.set(assets);
          this.loadingState.set('success');
          this.lastUpdated.set(new Date());
        }
      });
  }

  loadGlobalData(): void {
    this.coinGecko
      .getGlobalData()
      .pipe(catchError(() => of(null)))
      .subscribe((data) => {
        if (data) this.globalData.set(data);
      });
  }

  refresh(): void {
    this.refresh$.next();
  }

  setSearch(query: string): void {
    this.searchQuery.set(query);
  }

  setCategory(category: FilterCategory): void {
    this.selectedCategory.set(category);
  }

  setSortField(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  setCurrency(currency: string): void {
    this.selectedCurrency.set(currency);
    this.loadAssets();
  }

  updateAssetPrices(
    updates: { symbol: string; price: number; priceChangePercent: number }[]
  ): void {
    this.assets.update((assets) =>
      assets.map((asset) => {
        const update = updates.find(
          (u) => u.symbol.toLowerCase() === asset.symbol.toLowerCase()
        );
        if (update) {
          return {
            ...asset,
            current_price: update.price,
            price_change_percentage_24h: update.priceChangePercent,
          };
        }
        return asset;
      })
    );
  }

  private startAutoRefresh(): void {
    interval(environment.refreshInterval)
      .pipe(startWith(0))
      .subscribe(() => this.loadAssets());
  }

  private applySorting(
    assets: Asset[],
    field: SortField,
    direction: SortDirection
  ): Asset[] {
    return [...assets].sort((a, b) => {
      const aVal = a[field] ?? 0;
      const bVal = b[field] ?? 0;
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
  }
}
