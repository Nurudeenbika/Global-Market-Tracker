import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PercentChangePipe } from '../../pipes/percent-change.pipe';

@Component({
  selector: 'gmt-change-badge',
  standalone: true,
  imports: [CommonModule, PercentChangePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="badge"
      [class.positive]="value >= 0"
      [class.negative]="value < 0"
      [class.badge--sm]="size === 'sm'"
      [class.badge--lg]="size === 'lg'"
    >
      <svg
        class="arrow"
        viewBox="0 0 10 10"
        [style.transform]="value >= 0 ? 'rotate(0)' : 'rotate(180deg)'"
      >
        <path d="M5 2 L8 7 L2 7 Z" />
      </svg>
      {{ value | percentChange }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.01em;
    }

    .badge--sm { padding: 2px 6px; font-size: 0.72rem; }
    .badge--lg { padding: 4px 10px; font-size: 0.9rem; }

    .positive {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.12);
    }

    .negative {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.12);
    }

    .arrow {
      width: 8px;
      height: 8px;
      fill: currentColor;
      transition: transform 0.2s ease;
    }
  `],
})
export class ChangeBadgeComponent {
  @Input() value = 0;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
