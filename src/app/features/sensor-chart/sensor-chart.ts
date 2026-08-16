import {
  Component,
  ElementRef,
  OnInit,
  afterNextRender,
  input,
  viewChild,
  effect,
  OnDestroy,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SensorDataPoint } from '../../core/models/sensor.model';

Chart.register(...registerables);

@Component({
  selector: 'app-sensor-chart',
  templateUrl: './sensor-chart.html',
  styleUrl: './sensor-chart.scss',
})
export class SensorChart implements OnInit, OnDestroy {
  // Required signal input for sensor data points
  readonly data = input.required<SensorDataPoint[]>();

  // Required signal view child reference for the canvas element
  readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');

  private chartInstance: Chart | null = null;
  private isInitialized = false;

  constructor() {
    // Modern Angular lifecycle hook for post-rendering tasks (browser-only execution)
    afterNextRender(() => {
      this.isInitialized = true;
      this.initChart();
    });

    // Reactive effect to update chart data whenever the signal input changes
    effect(() => {
      const currentData = this.data();
      if (this.isInitialized && this.chartInstance) {
        this.updateChartData(currentData);
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  // Initialize the Chart.js instance
  private initChart(): void {
    const ctx = this.canvasRef().nativeElement.getContext('2d');
    if (!ctx) return;

    const points = this.data();
    const labels = points.map((p) =>
      new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Acceleration (g)',
            data: points.map((p) => p.acceleration),
            borderColor: 'var(--accent-accel)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.3,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: 'Temperature (°C)',
            data: points.map((p) => p.temperature),
            borderColor: 'var(--accent-env)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.3,
            fill: true,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Inter' } },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#f59e0b' },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#8b5cf6' },
          },
        },
      },
    });
  }

  // Update existing chart instance dynamically when new data arrives
  private updateChartData(points: SensorDataPoint[]): void {
    if (!this.chartInstance) return;

    const labels = points.map((p) =>
      new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );

    this.chartInstance.data.labels = labels;
    this.chartInstance.data.datasets[0].data = points.map((p) => p.acceleration);
    this.chartInstance.data.datasets[1].data = points.map((p) => p.temperature);

    this.chartInstance.update();
  }
}
