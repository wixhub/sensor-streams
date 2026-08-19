import { Component, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MovebankService } from '../../core/services/movebank.service';
import { StatCard } from '../stat-card/stat-card';
import { SensorChart } from '../sensor-chart/sensor-chart';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, StatCard, SensorChart, SlicePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard {
  readonly movebankService = inject(MovebankService);
  private readonly cd = inject(ChangeDetectorRef);

  private readonly DEFAULT_STUDY_ID = '2911040';

  // State signals
  readonly rawSensorData = signal<any[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private errorTimeoutId: any = null;

  // Form controls including points limit selector (max 1000)
  readonly studyIdInput = new FormControl(this.DEFAULT_STUDY_ID, { nonNullable: true });
  readonly streamFilter = new FormControl('all', { nonNullable: true });
  readonly pointsLimit = new FormControl('250', { nonNullable: true }); // Default limit option

  private readonly filterValue = toSignal(this.streamFilter.valueChanges, {
    initialValue: this.streamFilter.value,
  });

  constructor() {
    this.studyIdInput.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.dismissError();
      }
    });

    this.loadStudyData(this.DEFAULT_STUDY_ID);
  }

  private showAutoClosingError(message: string): void {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }

    this.errorMessage.set(message);
    this.cd.markForCheck();

    this.errorTimeoutId = setTimeout(() => {
      this.errorMessage.set(null);
      this.cd.markForCheck();
    }, 12000);
  }

  public dismissError(): void {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
      this.errorTimeoutId = null;
    }
    this.errorMessage.set(null);
    this.cd.markForCheck();
  }

  /**
   * Loads study data passing the user-selected points limit.
   */
  private loadStudyData(id: string, isFallback = false): void {
    this.loading.set(true);
    this.cd.markForCheck();

    const limit = parseInt(this.pointsLimit.value, 10) || 250;

    this.movebankService.fetchSensorData(id, limit).subscribe({
      next: (data) => {
        this.loading.set(false);
        if (data && data.length > 0) {
          this.movebankService.studyId.set(id);
          this.rawSensorData.set(data);
          this.cd.markForCheck();
          if (!isFallback) {
            this.dismissError();
          }
        } else {
          this.handleFetchError(id, 'No telemetry data returned for this study ID.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.handleFetchError(id, 'Server error (500) or invalid study ID stream.');
      },
    });
  }

  private handleFetchError(failedId: string, reason: string): void {
    this.showAutoClosingError(
      `Failed to load Study ID "${failedId}". ${reason} Reverting to default (${this.DEFAULT_STUDY_ID}).`,
    );

    this.studyIdInput.setValue(this.DEFAULT_STUDY_ID, { emitEvent: false });

    if (this.movebankService.studyId() !== this.DEFAULT_STUDY_ID) {
      const limit = parseInt(this.pointsLimit.value, 10) || 250;
      this.movebankService
        .fetchSensorData(this.DEFAULT_STUDY_ID, limit)
        .subscribe((defaultData) => {
          if (defaultData) {
            this.movebankService.studyId.set(this.DEFAULT_STUDY_ID);
            this.rawSensorData.set(defaultData);
            this.cd.markForCheck();
          }
        });
    }
  }

  public loadCustomStudy(): void {
    const targetId = this.studyIdInput.value.trim();
    if (!targetId) return;
    this.loadStudyData(targetId);
  }

  // Triggered when user changes the points limit dropdown
  public onLimitChange(): void {
    const currentId = this.movebankService.studyId();
    this.loadStudyData(currentId);
  }

  // Filtered sensor data
  readonly sensorData = computed(() => {
    const data = this.rawSensorData();
    const filter = this.filterValue();

    if (filter === 'gps') {
      return data.filter((item) => item.latitude !== 0 && item.longitude !== 0);
    }
    if (filter === 'accel') {
      return data.filter((item) => item.acceleration !== undefined && item.acceleration > 0);
    }
    return data;
  });

  // Computed metrics
  readonly accelMetrics = computed(() => {
    const data = this.sensorData();
    if (data.length === 0) return { current: 0, min: 0, max: 0, avg: 0 };
    const values = data.map((d) => d.acceleration ?? 0);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      current: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
    };
  });

  readonly tempMetrics = computed(() => {
    const data = this.sensorData();
    if (data.length === 0) return { current: 0, min: 0, max: 0, avg: 0 };
    const values = data.map((d) => d.temperature ?? 0);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      current: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
    };
  });

  readonly altitudeMetrics = computed(() => {
    const data = this.sensorData();
    if (data.length === 0) return { current: 0, min: 0, max: 0, avg: 0 };
    const values = data.map((d) => d.altitude ?? 0);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      current: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
    };
  });
}
