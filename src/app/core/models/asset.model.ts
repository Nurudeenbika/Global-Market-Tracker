export interface Asset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: AssetROI | null;
  last_updated: string;
  sparkline_in_7d?: { price: number[] };
}

export interface AssetROI {
  times: number;
  currency: string;
  percentage: number;
}

export interface AssetDetail {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { thumb: string; small: string; large: string };
  market_cap_rank: number;
  market_data: AssetMarketData;
  links: AssetLinks;
  categories: string[];
  genesis_date: string | null;
}

export interface AssetMarketData {
  current_price: { [currency: string]: number };
  market_cap: { [currency: string]: number };
  total_volume: { [currency: string]: number };
  high_24h: { [currency: string]: number };
  low_24h: { [currency: string]: number };
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  price_change_percentage_1y: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: { [currency: string]: number };
  atl: { [currency: string]: number };
}

export interface AssetLinks {
  homepage: string[];
  blockchain_site: string[];
  official_forum_url: string[];
  twitter_screen_name: string;
  telegram_channel_identifier: string;
  subreddit_url: string;
}

export interface AssetChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface MarketGlobal {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { [currency: string]: number };
    total_volume: { [currency: string]: number };
    market_cap_percentage: { [currency: string]: number };
    market_cap_change_percentage_24h_usd: number;
  };
}

export type SortField =
  | 'market_cap_rank'
  | 'current_price'
  | 'price_change_percentage_24h'
  | 'market_cap'
  | 'total_volume';

export type SortDirection = 'asc' | 'desc';

export type FilterCategory = 'all' | 'top_gainers' | 'top_losers' | 'watchlist';

export interface MarketFilter {
  search: string;
  category: FilterCategory;
  sortField: SortField;
  sortDirection: SortDirection;
  currency: string;
  page: number;
  perPage: number;
}
