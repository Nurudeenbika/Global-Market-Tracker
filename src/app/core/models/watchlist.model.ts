export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  addedAt: number;
}

export interface WatchlistState {
  items: WatchlistItem[];
}

export const WATCHLIST_STORAGE_KEY = 'gmt_watchlist';
