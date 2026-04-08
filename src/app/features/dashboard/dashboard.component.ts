import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MarketStateService } from '../../core/services/market-state.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { Asset, FilterCategory, SortField } from '../../core/models/asset.model';
import { SparklineComponent } from '../../shared/components/sparkline/sparkline.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ChangeBadgeComponent } from '../../shared/components/change-badge/change-badge.component';
import { PriceFlashDirective } from '../../shared/directives/price-flash.directive';
import { CryptoCurrencyPipe } from '../../shared/pipes/crypto-currency.pipe';
import { LargeNumberPipe } from '../../shared/pipes/large-number.pipe';
import { environment } from '@environments/environment';

@Component({
  selector: 'gmt-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    SparklineComponent,
    SkeletonComponent,
    ChangeBadgeComponent,
    PriceFlashDirective,
    CryptoCurrencyPipe,
    LargeNumberPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly marketState = inject(MarketStateService);
  readonly watchlistService = inject(WatchlistService);

  readonly searchControl = new FormControl('');
  readonly skeletonRows = Array(12).fill(0);
  readonly refreshInterval = environment.refreshInterval / 1000;

  private readonly destroy$ = new Subject<void>();

  readonly categories: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'All Assets' },
    { value: 'top_gainers', label: '🚀 Top Gainers' },
    { value: 'top_losers', label: '📉 Top Losers' },
    { value: 'watchlist', label: '⭐ Watchlist' },
  ];

  readonly sortColumns: { field: SortField; label: string }[] = [
    { field: 'market_cap_rank', label: '#' },
    { field: 'current_price', label: 'Price' },
    { field: 'price_change_percentage_24h', label: '24h %' },
    { field: 'market_cap', label: 'Market Cap' },
    { field: 'total_volume', label: 'Volume (24h)' },
  ];

  ngOnInit(): void {
    // Debounced search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(environment.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        this.marketState.setSearch(query ?? '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCategory(category: FilterCategory): void {
    this.marketState.setCategory(category);
  }

  sort(field: SortField): void {
    this.marketState.setSortField(field);
  }

  getSortIcon(field: SortField): string {
    if (this.marketState.sortField() !== field) return '↕';
    return this.marketState.sortDirection() === 'asc' ? '↑' : '↓';
  }

  isSortActive(field: SortField): boolean {
    return this.marketState.sortField() === field;
  }

  toggleWatchlist(event: Event, asset: Asset): void {
    event.preventDefault();
    event.stopPropagation();
    this.watchlistService.toggle(asset);
  }

  trackByAssetId(_: number, asset: Asset): string {
    return asset.id;
  }
}
