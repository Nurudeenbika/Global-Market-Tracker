import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Subject, of } from "rxjs";
import { takeUntil, catchError, switchMap } from "rxjs/operators";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, ChartData } from "chart.js";
import { CoinGeckoService } from "../../core/services/coin-gecko.service";
import { WatchlistService } from "../../core/services/watchlist.service";
import { AssetDetail, AssetChartData } from "../../core/models/asset.model";
import { CryptoCurrencyPipe } from "../../shared/pipes/crypto-currency.pipe";
import { LargeNumberPipe } from "../../shared/pipes/large-number.pipe";
import { ChangeBadgeComponent } from "../../shared/components/change-badge/change-badge.component";
import { SkeletonComponent } from "../../shared/components/skeleton/skeleton.component";
import { MarketStateService } from "../../core/services/market-state.service";

type ChartRange = "1" | "7" | "30" | "90" | "365";

@Component({
  selector: "gmt-asset-detail",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BaseChartDirective,
    CryptoCurrencyPipe,
    LargeNumberPipe,
    ChangeBadgeComponent,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./asset-detail.component.html",
  styleUrls: ["./asset-detail.component.scss"],
})
export class AssetDetailComponent implements OnInit, OnDestroy {
  @Input() id!: string;

  private readonly coinGecko = inject(CoinGeckoService);
  readonly watchlistService = inject(WatchlistService);
  readonly marketState = inject(MarketStateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly asset = signal<AssetDetail | null>(null);
  readonly loading = signal(true);
  readonly chartLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedRange = signal<ChartRange>("30");

  readonly chartRanges: { value: ChartRange; label: string }[] = [
    { value: "1", label: "24H" },
    { value: "7", label: "7D" },
    { value: "30", label: "1M" },
    { value: "90", label: "3M" },
    { value: "365", label: "1Y" },
  ];

  chartData: ChartData<"line"> = {
    labels: [],
    datasets: [
      {
        label: "Price",
        data: [],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.08)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  chartOptions: ChartConfiguration["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e2130",
        titleColor: "#94a3b8",
        bodyColor: "#f1f5f9",
        borderColor: "#2d3452",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: (items) => {
            const ts = Number(items[0].label);
            return new Date(ts).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          },
          label: (item) => {
            const price = item.parsed.y;
            if (price === null || price === undefined) return "";
            return ` $${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false, color: "#1e2130" },
        ticks: {
          color: "#64748b",
          maxTicksLimit: 8,
          font: { size: 11 },
          callback: (_, index, ticks) => {
            const label = (this.chartData.labels as number[])?.[index];
            if (!label) return "";
            const d = new Date(label);
            const range = this.selectedRange();
            if (range === "1")
              return d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });
            return d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          },
        },
        border: { color: "#1e2130" },
      },
      y: {
        display: true,
        position: "right",
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
          callback: (value) => {
            const v = Number(value);
            if (v >= 1000) return "$" + (v / 1000).toFixed(1) + "k";
            return "$" + v.toFixed(2);
          },
        },
        border: { color: "#1e2130" },
      },
    },
  };

  readonly isWatched = computed(() =>
    this.asset() ? this.watchlistService.isWatched(this.asset()!.id) : false,
  );

  ngOnInit(): void {
    this.loadAsset();
    this.loadChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAsset(): void {
    this.loading.set(true);
    this.coinGecko
      .getAssetDetail(this.id)
      .pipe(
        catchError((err) => {
          this.error.set(err.message || "Failed to load asset");
          return of(null);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((asset) => {
        this.asset.set(asset);
        this.loading.set(false);
        this.cdr.markForCheck();
      });
  }

  loadChart(range?: ChartRange): void {
    if (range) this.selectedRange.set(range);
    this.chartLoading.set(true);

    const days = parseInt(this.selectedRange(), 10);
    const currency = this.marketState.selectedCurrency();

    this.coinGecko
      .getAssetChart(this.id, currency, days)
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$),
      )
      .subscribe((chartData) => {
        if (chartData) {
          this.updateChart(chartData);
        }
        this.chartLoading.set(false);
        this.cdr.markForCheck();
      });
  }

  private updateChart(data: AssetChartData): void {
    const isPositive =
      data.prices.length > 1 &&
      data.prices[data.prices.length - 1][1] >= data.prices[0][1];

    const color = isPositive ? "#22c55e" : "#ef4444";

    this.chartData = {
      labels: data.prices.map(([ts]) => ts),
      datasets: [
        {
          ...this.chartData.datasets[0],
          data: data.prices.map(([, price]) => price),
          borderColor: color,
          backgroundColor: isPositive
            ? "rgba(34, 197, 94, 0.08)"
            : "rgba(239, 68, 68, 0.08)",
        },
      ],
    };
  }

  toggleWatchlist(): void {
    const a = this.asset();
    if (!a) return;

    const asAsset = {
      id: a.id,
      symbol: a.symbol,
      name: a.name,
      image: a.image.small,
      current_price: a.market_data.current_price["usd"] ?? 0,
      market_cap: 0,
      market_cap_rank: a.market_cap_rank,
      fully_diluted_valuation: null,
      total_volume: 0,
      high_24h: 0,
      low_24h: 0,
      price_change_24h: 0,
      price_change_percentage_24h: a.market_data.price_change_percentage_24h,
      market_cap_change_24h: 0,
      market_cap_change_percentage_24h: 0,
      circulating_supply: a.market_data.circulating_supply,
      total_supply: a.market_data.total_supply,
      max_supply: a.market_data.max_supply,
      ath: a.market_data.ath["usd"] ?? 0,
      ath_change_percentage: 0,
      ath_date: "",
      atl: a.market_data.atl["usd"] ?? 0,
      atl_change_percentage: 0,
      atl_date: "",
      roi: null,
      last_updated: "",
    };

    this.watchlistService.toggle(asAsset as never);
  }
}
