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
  private readonly cd = inject(ChangeDetectorRef); // Inject change detector for reliable UI updates

  private readonly DEFAULT_STUDY_ID = '2911040';

  // State signals for data, loading, and the error banner
  readonly rawSensorData = signal<any[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private errorTimeoutId: any = null;

  // Form controls
  readonly studyIdInput = new FormControl(this.DEFAULT_STUDY_ID, { nonNullable: true });
  readonly streamFilter = new FormControl('all', { nonNullable: true });

  private readonly filterValue = toSignal(this.streamFilter.valueChanges, {
    initialValue: this.streamFilter.value,
  });

  constructor() {
    // Clear the error message immediately if the user starts typing a new ID
    this.studyIdInput.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.dismissError();
      }
    });

    // Load initial default study data on component load
    this.loadStudyData(this.DEFAULT_STUDY_ID);
  }

  /**
   * Displays the error banner, forces change detection, and keeps it visible for 12 seconds.
   */
  private showAutoClosingError(message: string): void {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }

    // Set the error message and explicitly trigger change detection for the UI
    this.errorMessage.set(message);
    this.cd.markForCheck();

    // Auto-hide the error banner after 12 seconds
    this.errorTimeoutId = setTimeout(() => {
      this.errorMessage.set(null);
      this.cd.markForCheck();
    }, 12000);
  }

  /**
   * Manually dismisses the error banner.
   */
  public dismissError(): void {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
      this.errorTimeoutId = null;
    }
    this.errorMessage.set(null);
    this.cd.markForCheck();
  }

  /**
   * Loads study data from the service.
   */
  private loadStudyData(id: string): void {
    this.loading.set(true);
    this.cd.markForCheck();

    this.movebankService.fetchSensorData(id).subscribe({
      next: (data) => {
        this.loading.set(false);
        if (data && data.length > 0) {
          this.movebankService.studyId.set(id);
          this.rawSensorData.set(data);
          this.cd.markForCheck();
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

  /**
   * Helper to trigger the error banner and fallback to the default study ID safely.
   */
  private handleFetchError(failedId: string, reason: string): void {
    // Show the persistent error message in the UI for 12 seconds
    this.showAutoClosingError(
      `Failed to load Study ID "${failedId}". ${reason} Reverting to default (${this.DEFAULT_STUDY_ID}).`,
    );

    // Update input field back to default
    this.studyIdInput.setValue(this.DEFAULT_STUDY_ID, { emitEvent: false });

    // Load default data only if we aren't already on it
    if (this.movebankService.studyId() !== this.DEFAULT_STUDY_ID) {
      this.movebankService.fetchSensorData(this.DEFAULT_STUDY_ID).subscribe((defaultData) => {
        if (defaultData) {
          this.movebankService.studyId.set(this.DEFAULT_STUDY_ID);
          this.rawSensorData.set(defaultData);
          this.cd.markForCheck();
        }
      });
    }
  }

  /**
   * Triggered when the user clicks "Load" or presses Enter.
   */
  public loadCustomStudy(): void {
    const targetId = this.studyIdInput.value.trim();
    if (!targetId) return;
    this.loadStudyData(targetId);
  }

  // Filtered sensor data based on the dropdown selection
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

  // Computed metrics for acceleration stat card
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

  // Computed metrics for temperature stat card
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

  // Computed metrics for altitude stat card
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
