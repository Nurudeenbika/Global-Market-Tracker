import { Injectable, signal, computed } from '@angular/core';
import {
  WatchlistItem,
  WatchlistState,
  WATCHLIST_STORAGE_KEY,
} from '../models/watchlist.model';
import { Asset } from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly watchlist = signal<WatchlistState>(this.loadFromStorage());

  readonly items = computed(() => this.watchlist().items);
  readonly count = computed(() => this.watchlist().items.length);
  readonly ids = computed(() =>
    new Set(this.watchlist().items.map((i) => i.id))
  );

  isWatched(id: string): boolean {
    return this.ids().has(id);
  }

  toggle(asset: Asset): void {
    if (this.isWatched(asset.id)) {
      this.remove(asset.id);
    } else {
      this.add(asset);
    }
  }

  add(asset: Asset): void {
    const item: WatchlistItem = {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      image: asset.image,
      addedAt: Date.now(),
    };

    this.watchlist.update((state) => ({
      items: [...state.items.filter((i) => i.id !== asset.id), item],
    }));

    this.persist();
  }

  remove(id: string): void {
    this.watchlist.update((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
    this.persist();
  }

  clearAll(): void {
    this.watchlist.set({ items: [] });
    this.persist();
  }

  getWatchlistIds(): string[] {
    return this.watchlist().items.map((i) => i.id);
  }

  private persist(): void {
    try {
      localStorage.setItem(
        WATCHLIST_STORAGE_KEY,
        JSON.stringify(this.watchlist())
      );
    } catch (e) {
      console.error('[Watchlist] Failed to persist to localStorage:', e);
    }
  }

  private loadFromStorage(): WatchlistState {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as WatchlistState;
      }
    } catch (e) {
      console.error('[Watchlist] Failed to load from localStorage:', e);
    }
    return { items: [] };
  }
}
