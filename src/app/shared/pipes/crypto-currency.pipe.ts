import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cryptoCurrency',
  standalone: true,
})
export class CryptoCurrencyPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    currency: string = 'USD',
    compact: boolean = false
  ): string {
    if (value === null || value === undefined || isNaN(value)) return '--';

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: this.getDecimalPlaces(value),
      maximumFractionDigits: this.getDecimalPlaces(value),
      notation: compact && Math.abs(value) >= 1000 ? 'compact' : 'standard',
    });

    return formatter.format(value);
  }

  private getDecimalPlaces(value: number): number {
    const abs = Math.abs(value);
    if (abs >= 1000) return 2;
    if (abs >= 1) return 4;
    if (abs >= 0.01) return 6;
    return 8;
  }
}
