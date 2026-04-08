import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WatchlistService } from '../../core/services/watchlist.service';
import { MarketStateService } from '../../core/services/market-state.service';
import { ChangeBadgeComponent } from '../../shared/components/change-badge/change-badge.component';
import { CryptoCurrencyPipe } from '../../shared/pipes/crypto-currency.pipe';
import { LargeNumberPipe } from '../../shared/pipes/large-number.pipe';
import { SparklineComponent } from '../../shared/components/sparkline/sparkline.component';
import { Asset } from '../../core/models/asset.model';

@Component({
  selector: 'gmt-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ChangeBadgeComponent,
    CryptoCurrencyPipe,
    LargeNumberPipe,
    SparklineComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="watchlist-page">
      <div class="page-header">
        <div>
          <h1>My Watchlist</h1>
          <p class="subtitle">
            {{ watchlistService.count() }} asset{{ watchlistService.count() !== 1 ? 's' : '' }} tracked
          </p>
        </div>
        @if (watchlistService.count() > 0) {
          <button class="clear-btn" (click)="confirmClear()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
            Clear All
          </button>
        }
      </div>

      @if (watchlistService.count() === 0) {
        <div class="empty-watchlist">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h2>Your watchlist is empty</h2>
          <p>Start tracking your favourite assets by clicking the ★ icon in the dashboard</p>
          <a routerLink="/dashboard" class="cta-btn">Browse Markets</a>
        </div>
      } @else {
        <div class="watchlist-grid">
          @for (item of watchlistAssets(); track item.id) {
            <a class="asset-card" [routerLink]="['/asset', item.id]">
              <div class="card-header">
                <div class="asset-info">
                  <img [src]="item.image" [alt]="item.name" class="asset-icon" loading="lazy" />
                  <div>
                    <div class="asset-name">{{ item.name }}</div>
                    <div class="asset-symbol">{{ item.symbol | uppercase }}</div>
                  </div>
                </div>
                <button
                  class="remove-btn"
                  (click)="removeFromWatchlist($event, item.id)"
                  title="Remove from watchlist"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </div>

              <div class="card-price">
                {{ item.current_price | cryptoCurrency: marketState.selectedCurrency() }}
              </div>

              <div class="card-change">
                <gmt-change-badge [value]="item.price_change_percentage_24h" />
              </div>

              @if (item.sparkline_in_7d?.price?.length) {
                <div class="card-chart">
                  <gmt-sparkline
                    [data]="item.sparkline_in_7d!.price"
                    [positive]="item.price_change_percentage_24h >= 0"
                    [width]="200"
                    [height]="48"
                  />
                </div>
              }

              <div class="card-stats">
                <div class="card-stat">
                  <span class="card-stat__label">Mkt Cap</span>
                  <span class="card-stat__value">
                    {{ item.market_cap | largeNumber: marketState.selectedCurrency() }}
                  </span>
                </div>
                <div class="card-stat">
                  <span class="card-stat__label">Volume</span>
                  <span class="card-stat__value">
                    {{ item.total_volume | largeNumber: marketState.selectedCurrency() }}
                  </span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .watchlist-page {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;

      h1 {
        font-family: var(--font-display);
        font-size: 1.75rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--text-primary);
        margin: 0 0 4px;
      }

      .subtitle {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin: 0;
      }
    }

    .clear-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: var(--red);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      flex-shrink: 0;

      svg { width: 14px; height: 14px; }

      &:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.4);
      }
    }

    .empty-watchlist {
      text-align: center;
      padding: 80px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      .empty-icon {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: var(--surface-2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;

        svg {
          width: 36px;
          height: 36px;
          color: var(--text-muted);
        }
      }

      h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }

      p {
        font-size: 0.9rem;
        color: var(--text-muted);
        max-width: 360px;
        line-height: 1.6;
        margin: 0;
      }
    }

    .cta-btn {
      display: inline-flex;
      padding: 10px 24px;
      background: var(--accent);
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      transition: opacity 0.15s;
      margin-top: 8px;

      &:hover { opacity: 0.85; }
    }

    .watchlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .asset-card {
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--accent-subtle);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .asset-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .asset-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }

    .asset-name {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-primary);
    }

    .asset-symbol {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .remove-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: none;
      border: none;
      cursor: pointer;
      color: #f59e0b;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;

      svg { width: 14px; height: 14px; }

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--red);
      }
    }

    .card-price {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }

    .card-chart { overflow: hidden; border-radius: 4px; }

    .card-stats {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px solid var(--border-subtle);
    }

    .card-stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .card-stat__label {
      font-size: 0.68rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      font-weight: 600;
    }

    .card-stat__value {
      font-size: 0.82rem;
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
      font-weight: 500;
    }
  `],
})
export class WatchlistComponent {
  readonly watchlistService = inject(WatchlistService);
  readonly marketState = inject(MarketStateService);

  readonly watchlistAssets = computed(() => {
    const ids = new Set(this.watchlistService.getWatchlistIds());
    return this.marketState.assets().filter((a) => ids.has(a.id));
  });

  removeFromWatchlist(event: Event, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.watchlistService.remove(id);
  }

  confirmClear(): void {
    if (confirm('Remove all assets from your watchlist?')) {
      this.watchlistService.clearAll();
    }
  }
}
