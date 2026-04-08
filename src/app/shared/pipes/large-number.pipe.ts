import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'largeNumber',
  standalone: true,
})
export class LargeNumberPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    currency: string = 'USD'
  ): string {
    if (value === null || value === undefined || isNaN(value)) return '--';

    const symbol = this.getCurrencySymbol(currency);
    const abs = Math.abs(value);

    if (abs >= 1_000_000_000_000) {
      return `${symbol}${(value / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (abs >= 1_000_000_000) {
      return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (abs >= 1_000_000) {
      return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
    }
    if (abs >= 1_000) {
      return `${symbol}${(value / 1_000).toFixed(2)}K`;
    }

    return `${symbol}${value.toFixed(2)}`;
  }

  private getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      usd: '$',
      eur: '€',
      gbp: '£',
      jpy: '¥',
      btc: '₿',
    };
    return symbols[currency.toLowerCase()] || currency.toUpperCase() + ' ';
  }
}
