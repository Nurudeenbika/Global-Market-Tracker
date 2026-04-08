import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gmt-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="skeleton"
      [style.width]="width"
      [style.height]="height"
      [class.rounded-full]="circle"
    ></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--surface-2) 25%,
        var(--surface-3) 50%,
        var(--surface-2) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .rounded-full { border-radius: 50%; }
  `],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() circle = false;
}
