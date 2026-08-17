import {
  Component, ElementRef, Input, ViewChild,
  AfterViewInit, OnChanges, SimpleChanges, OnDestroy,
} from '@angular/core';
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `<div class="bar-chart-wrapper"><canvas #canvas></canvas></div>`,
  styles: [`.bar-chart-wrapper { position: relative; height: 220px; }`],
})
export class BarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() maxValue = 20;
  @Input() color = '#4f7a42';

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit() {
    this.render();
  }

  ngOnChanges(_: SimpleChanges) {
    if (this.chart) this.render();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private render() {
    this.chart?.destroy();

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: this.color,
          borderRadius: 6,
          maxBarThickness: 48,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, max: this.maxValue } },
        plugins: { legend: { display: false } },
      },
    });
  }
}