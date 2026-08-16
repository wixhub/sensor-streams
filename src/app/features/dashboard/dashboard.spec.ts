import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { MovebankService } from '../../core/services/movebank.service';
import { SensorDataPoint } from '../../core/models/sensor.model';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let movebankServiceMock: { getSensorStreams: ReturnType<typeof vi.fn> };

  const mockSensorData: SensorDataPoint[] = [
    {
      timestamp: '2026-08-16T12:00:00Z',
      latitude: 47.65,
      longitude: 9.47,
      acceleration: 1.2,
      temperature: 22.5,
      altitude: 400,
    },
    {
      timestamp: '2026-08-16T12:01:00Z',
      latitude: 47.66,
      longitude: 9.48,
      acceleration: 2.0,
      temperature: 24.5,
      altitude: 420,
    },
  ];

  beforeEach(async () => {
    // Create a mock for MovebankService
    movebankServiceMock = {
      getSensorStreams: vi.fn().mockReturnValue(of(mockSensorData)),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{ provide: MovebankService, useValue: movebankServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Verify component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Verify sensor data is loaded correctly via toSignal
  it('should load sensor data and compute metrics properly', () => {
    const data = component.sensorData();
    expect(data.length).toBe(2);
    expect(data).toEqual(mockSensorData);

    // Verify loading state is false after data is loaded
    expect(component.loading()).toBeFalsy();

    // Verify computed metrics
    const accel = component.accelMetrics();
    expect(accel.min).toBe(1.2);
    expect(accel.max).toBe(2.0);
    expect(accel.avg).toBe(1.6);

    const temp = component.tempMetrics();
    expect(temp.min).toBe(22.5);
    expect(temp.max).toBe(24.5);
    expect(temp.avg).toBe(23.5);

    const altitude = component.altitudeMetrics();
    expect(altitude.min).toBe(400);
    expect(altitude.max).toBe(420);
    expect(altitude.avg).toBe(410);
  });

  // Verify handling of empty or error states from the service
  it('should return default metrics when sensor data is empty', async () => {
    movebankServiceMock.getSensorStreams.mockReturnValue(of([]));

    // Re-create fixture to test empty initial state
    const emptyFixture = TestBed.createComponent(Dashboard);
    const emptyComponent = emptyFixture.componentInstance;
    emptyFixture.detectChanges();

    expect(emptyComponent.sensorData()).toEqual([]);
    expect(emptyComponent.loading()).toBeTruthy();

    expect(emptyComponent.accelMetrics()).toEqual({ min: 0, max: 0, avg: 0 });
    expect(emptyComponent.tempMetrics()).toEqual({ min: 0, max: 0, avg: 0 });
    expect(emptyComponent.altitudeMetrics()).toEqual({ min: 0, max: 0, avg: 0 });
  });
});
