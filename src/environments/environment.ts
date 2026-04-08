export const environment = {
  production: false,
  apiBaseUrl: 'https://api.coingecko.com/api/v3',
  wsUrl: 'wss://stream.binance.com:9443/ws',
  refreshInterval: 30000, // 30 seconds
  debounceTime: 400,
  defaultCurrency: 'usd',
  defaultItemsPerPage: 50,
  chartHistoryDays: 30,
};
