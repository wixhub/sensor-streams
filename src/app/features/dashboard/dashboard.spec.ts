import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { MovebankService } from '../../core/services/movebank.service';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let movebankServiceMock: Partial<MovebankService>;

  // Setup testing module before each test case
  beforeEach(async () => {
    // Create a mock implementation of the MovebankService
    movebankServiceMock = {
      studyId: Object.assign(vi.fn().mockReturnValue('2911040'), {
        set: vi.fn(),
        update: vi.fn(),
      }) as any,
      fetchSensorData: vi.fn().mockReturnValue(
        of([
          {
            timestamp: '2026-06-01T12:00:00Z',
            latitude: 52.52,
            longitude: 13.405,
            acceleration: 1.2,
            temperature: 21.5,
            altitude: 150.0,
          },
          {
            timestamp: '2026-06-01T12:01:00Z',
            latitude: 0,
            longitude: 0,
            acceleration: 0,
            temperature: 20.0,
            altitude: 120.0,
          },
        ]),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MovebankService, useValue: movebankServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Ensure component instance is successfully created
  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
    expect(component.loading()).toBe(false);
  });

  // Test custom study loading flow
  it('should load custom study data successfully when loadCustomStudy is called', () => {
    component.studyIdInput.setValue('9999999');
    component.loadCustomStudy();

    expect(movebankServiceMock.fetchSensorData).toHaveBeenCalledWith('9999999');
    expect(component.rawSensorData().length).toBe(2);
  });

  // Test data filtering logic computed signals (e.g., GPS filter)
  it('should filter sensor data correctly based on streamFilter selection', () => {
    // Set filter to GPS (should exclude items where lat/lon are 0)
    component.streamFilter.setValue('gps');

    const filtered = component.sensorData();
    expect(filtered.length).toBe(1);
    expect(filtered[0].latitude).toBe(52.52);
  });

  // Test error handling and fallback behavior when fetch fails
  it('should handle fetch errors and revert to default study ID', () => {
    // Mock service to throw an error on fetch
    vi.spyOn(movebankServiceMock, 'fetchSensorData').mockReturnValueOnce(
      throwError(() => new Error('Network error')),
    );

    component.studyIdInput.setValue('bad_id');
    component.loadCustomStudy();

    // Check that error message is set and input reverted to default
    expect(component.errorMessage()).toContain('Failed to load Study ID "bad_id"');
    expect(component.studyIdInput.value).toBe('2911040');
  });

  // Test manual error banner dismissal
  it('should dismiss the error message correctly when dismissError is called', () => {
    component.errorMessage.set('Test error banner');
    expect(component.errorMessage()).toBe('Test error banner');

    component.dismissError();
    expect(component.errorMessage()).toBeNull();
  });
});
