/// <reference types="vitest/globals" />

import { TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { MovebankService } from '../../core/services/movebank.service';
import { of, throwError } from 'rxjs';

describe('Dashboard', () => {
  let movebankServiceMock: {
    fetchSensorData: ReturnType<typeof vi.fn>;
    studyId: {
      set: ReturnType<typeof vi.fn>;
      (): string;
    };
  };

  const mockSensorData = [
    { latitude: 10, longitude: 20, acceleration: 5, temperature: 22, altitude: 100 },
    { latitude: 15, longitude: 25, acceleration: 8, temperature: 24, altitude: 150 },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    movebankServiceMock = {
      fetchSensorData: vi.fn().mockReturnValue(of(mockSensorData)),
      studyId: Object.assign(vi.fn().mockReturnValue('2911040'), {
        set: vi.fn(),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{ provide: MovebankService, useValue: movebankServiceMock }],
    }).compileComponents();
  });

  it('should create the dashboard component and load default study data on init', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(movebankServiceMock.fetchSensorData).toHaveBeenCalledWith('2911040', 250);
    expect(component.rawSensorData()).toEqual(mockSensorData);
  });

  it('should filter sensor data correctly based on streamFilter', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.rawSensorData.set([
      { latitude: 0, longitude: 0, acceleration: 0 },
      { latitude: 12, longitude: 34, acceleration: 5 },
    ]);

    // Test 'gps' filter
    component.streamFilter.setValue('gps');
    expect(component.sensorData()).toEqual([{ latitude: 12, longitude: 34, acceleration: 5 }]);

    // Test 'accel' filter
    component.streamFilter.setValue('accel');
    expect(component.sensorData()).toEqual([{ latitude: 12, longitude: 34, acceleration: 5 }]);

    // Test 'all' filter
    component.streamFilter.setValue('all');
    expect(component.sensorData().length).toBe(2);
  });

  it('should compute metrics correctly', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.rawSensorData.set([
      { acceleration: 2, temperature: 10, altitude: 100 },
      { acceleration: 4, temperature: 20, altitude: 300 },
    ]);

    const accel = component.accelMetrics();
    expect(accel).toEqual({ current: 4, min: 2, max: 4, avg: 3 });

    const temp = component.tempMetrics();
    expect(temp).toEqual({ current: 20, min: 10, max: 20, avg: 15 });

    const alt = component.altitudeMetrics();
    expect(alt).toEqual({ current: 300, min: 100, max: 300, avg: 200 });
  });

  it('should handle custom study loading successfully', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.studyIdInput.setValue('999999');
    component.loadCustomStudy();

    expect(movebankServiceMock.fetchSensorData).toHaveBeenCalledWith('999999', 250);
  });

  it('should handle fetch errors and fallback to default study', () => {
    movebankServiceMock.fetchSensorData.mockImplementation((id: string) => {
      if (id === 'BAD_ID') {
        return throwError(() => new Error('Network error'));
      }
      return of(mockSensorData);
    });

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.studyIdInput.setValue('BAD_ID');
    component.loadCustomStudy();

    expect(component.errorMessage()).toContain('Failed to load Study ID "BAD_ID"');
    expect(component.studyIdInput.value).toBe('2911040');
  });

  it('should dismiss error message correctly', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.errorMessage.set('Test error');
    expect(component.errorMessage()).toBe('Test error');

    component.dismissError();
    expect(component.errorMessage()).toBeNull();
  });

  it('should reload data when limit changes', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    vi.spyOn(movebankServiceMock, 'studyId').mockReturnValue('2911040');
    component.pointsLimit.setValue('500');
    component.onLimitChange();

    expect(movebankServiceMock.fetchSensorData).toHaveBeenCalledWith('2911040', 500);
  });
});
