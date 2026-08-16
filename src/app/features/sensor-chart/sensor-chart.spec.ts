import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SensorChart } from './sensor-chart';
import { SensorDataPoint } from '../../core/models/sensor.model';

describe('SensorChart', () => {
  let component: SensorChart;
  let fixture: ComponentFixture<SensorChart>;

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
      acceleration: 1.5,
      temperature: 23.0,
      altitude: 405,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorChart],
    }).compileComponents();

    fixture = TestBed.createComponent(SensorChart);
    component = fixture.componentInstance;

    // Set the required input before triggering change detection
    fixture.componentRef.setInput('data', mockSensorData);
    fixture.detectChanges();
  });

  // Verify component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Verify that canvas element is present in the DOM via viewChild
  it('should have a canvas reference', () => {
    const canvas = component.canvasRef();
    expect(canvas).toBeTruthy();
    expect(canvas.nativeElement.tagName).toBe('CANVAS');
  });

  // Verify input signal updates correctly
  it('should accept new sensor data via input signal', () => {
    const newMockData: SensorDataPoint[] = [
      {
        timestamp: '2026-08-16T12:02:00Z',
        latitude: 47.67,
        longitude: 9.49,
        acceleration: 2.0,
        temperature: 24.1,
        altitude: 410,
      },
    ];

    fixture.componentRef.setInput('data', newMockData);
    fixture.detectChanges();

    expect(component.data()).toEqual(newMockData);
  });
});
