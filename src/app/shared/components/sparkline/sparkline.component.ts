import {
  Component,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gmt-sparkline',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas #sparklineCanvas [width]="width" [height]="height"></canvas>
  `,
  styles: [`
    canvas { display: block; }
  `],
})
export class SparklineComponent implements OnChanges, AfterViewInit {
  @Input() data: number[] = [];
  @Input() positive = true;
  @Input() width = 120;
  @Input() height = 40;

  @ViewChild('sparklineCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    this.draw();
  }

  ngOnChanges(): void {
    if (this.initialized) this.draw();
  }

  private draw(): void {
    if (!this.canvasRef || !this.data?.length) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = this.width;
    const h = this.height;
    const padding = 4;
    const prices = this.data;

    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = prices.map((p, i) => ({
      x: padding + (i / (prices.length - 1)) * (w - padding * 2),
      y: h - padding - ((p - min) / range) * (h - padding * 2),
    }));

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    const color = this.positive ? '#22c55e' : '#ef4444';
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');

    ctx.beginPath();
    ctx.moveTo(points[0].x, h);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i === 0) return;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
