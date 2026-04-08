import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[gmtPriceFlash]',
  standalone: true,
})
export class PriceFlashDirective implements OnChanges {
  @Input('gmtPriceFlash') price: number | undefined;

  private previousPrice: number | undefined;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    const current = changes['price'];
    if (!current.firstChange && current.previousValue !== current.currentValue) {
      const increased = current.currentValue > current.previousValue;
      this.flash(increased ? 'flash-up' : 'flash-down');
      this.previousPrice = current.currentValue;
    }
  }

  private flash(className: string): void {
    this.renderer.addClass(this.el.nativeElement, className);
    setTimeout(() => {
      this.renderer.removeClass(this.el.nativeElement, className);
    }, 800);
  }
}
