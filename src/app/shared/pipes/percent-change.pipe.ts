import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentChange',
  standalone: true,
})
export class PercentChangePipe implements PipeTransform {
  transform(value: number | null | undefined, showSign: boolean = true): string {
    if (value === null || value === undefined || isNaN(value)) return '--';

    const formatted = Math.abs(value).toFixed(2);
    if (!showSign) return `${formatted}%`;

    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }
}
