import {
  Component,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WatchlistService } from '../../core/services/watchlist.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'gmt-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar__logo">
        <div class="logo-mark">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="var(--accent)" stroke-width="2"/>
            <path d="M8 20 L13 13 L18 17 L24 10" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        @if (!collapsed()) {
          <span class="logo-text">GlobalMarket</span>
        }
      </div>

      <button class="collapse-btn" (click)="toggle()" [title]="collapsed() ? 'Expand' : 'Collapse'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          @if (collapsed()) {
            <path d="M9 18l6-6-6-6"/>
          } @else {
            <path d="M15 18l-6-6 6-6"/>
          }
        </svg>
      </button>

      <nav class="sidebar__nav">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item"
            [title]="collapsed() ? item.label : ''"
          >
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            @if (!collapsed()) {
              <span class="nav-label">{{ item.label }}</span>
              @if (item.route === '/watchlist' && watchlistService.count() > 0) {
                <span class="nav-badge">{{ watchlistService.count() }}</span>
              }
            }
          </a>
        }
      </nav>

      <div class="sidebar__footer">
        @if (!collapsed()) {
          <div class="footer-text">
            <span class="powered-by">Powered by CoinGecko</span>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 220px;
      min-height: 100vh;
      background: var(--surface-1);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 10;
      flex-shrink: 0;
    }

    .sidebar.collapsed { width: 64px; }

    .sidebar__logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }

    .logo-mark svg {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .logo-text {
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      letter-spacing: -0.02em;
    }

    .collapse-btn {
      position: absolute;
      right: -12px;
      top: 60px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--surface-2);
      border: 1px solid var(--border);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all 0.2s;
      z-index: 20;
    }

    .collapse-btn:hover {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }

    .collapse-btn svg { width: 12px; height: 12px; }

    .sidebar__nav {
      flex: 1;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s;
      white-space: nowrap;
      overflow: hidden;
      position: relative;
    }

    .nav-item:hover {
      background: var(--surface-2);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: rgba(99, 102, 241, 0.12);
      color: var(--accent);
    }

    .nav-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-icon :global(svg) {
      width: 18px;
      height: 18px;
    }

    .nav-label { flex: 1; }

    .nav-badge {
      background: var(--accent);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .sidebar__footer {
      padding: 16px;
      border-top: 1px solid var(--border);
    }

    .powered-by {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
    }
  `],
})
export class SidebarComponent {
  readonly watchlistService = inject(WatchlistService);
  readonly collapsed = signal(false);

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>`,
    },
    {
      label: 'Watchlist',
      route: '/watchlist',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>`,
    },
  ];

  toggle(): void {
    this.collapsed.update((c) => !c);
  }
}
