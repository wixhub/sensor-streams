import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MovebankService } from '../../core/services/movebank.service';
import { MetricSummary } from '../../core/models/sensor.model';
import { StatCard } from '../stat-card/stat-card';
import { SensorChart } from '../sensor-chart/sensor-chart';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, StatCard, SensorChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly movebankService = inject(MovebankService);

  // Convert HttpClient Observable directly into a Signal using toSignal
  readonly sensorData = toSignal(this.movebankService.getSensorStreams(), {
    initialValue: [],
  });

  // Derived loading state based on whether data has arrived
  readonly loading = computed(() => this.sensorData().length === 0);

  // Reactive Filter Form control
  readonly streamFilter = new FormControl('all', { nonNullable: true });

  // Helper function to calculate min, max, and average metrics
  private calculateMetrics(values: number[]): MetricSummary {
    if (!values.length) return { min: 0, max: 0, avg: 0 };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  }

  // Computed Statistical Summaries
  readonly accelMetrics = computed<MetricSummary>(() =>
    this.calculateMetrics(this.sensorData().map((d) => d.acceleration)),
  );

  readonly tempMetrics = computed<MetricSummary>(() =>
    this.calculateMetrics(this.sensorData().map((d) => d.temperature)),
  );

  readonly altitudeMetrics = computed<MetricSummary>(() =>
    this.calculateMetrics(this.sensorData().map((d) => d.altitude)),
  );
}
