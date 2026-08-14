import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MovebankService } from '../../core/services/movebank.service';
import { SensorDataPoint, MetricSummary } from '../../core/models/sensor.model';
import { StatCard } from '../stat-card/stat-card';
import { SensorChart } from '../sensor-chart/sensor-chart';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule, StatCard, SensorChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private movebankService = inject(MovebankService);

  // Core Signals State
  sensorData = signal<SensorDataPoint[]>([]);
  loading = signal<boolean>(true);

  // Reactive Filter Form control
  streamFilter = new FormControl('all');

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.movebankService.getSensorStreams().subscribe({
      next: (data) => {
        this.sensorData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  // Computed Statistical Summaries
  accelMetrics = computed<MetricSummary>(() => {
    const data = this.sensorData();
    if (!data.length) return { min: 0, max: 0, avg: 0 };
    const values = data.map((d) => d.acceleration);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  });

  tempMetrics = computed<MetricSummary>(() => {
    const data = this.sensorData();
    if (!data.length) return { min: 0, max: 0, avg: 0 };
    const values = data.map((d) => d.temperature);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  });

  altitudeMetrics = computed<MetricSummary>(() => {
    const data = this.sensorData();
    if (!data.length) return { min: 0, max: 0, avg: 0 };
    const values = data.map((d) => d.altitude);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  });
}
