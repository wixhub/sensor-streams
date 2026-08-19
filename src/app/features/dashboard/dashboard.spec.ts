import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Dashboard } from './dashboard';
import { MovebankService } from '../../core/services/movebank.service';
import { of, throwError } from 'rxjs';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let movebankService: MovebankService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [MovebankService, provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    movebankService = TestBed.inject(MovebankService);
  });

  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should load default study data on initialization', () => {
    const spy = vi.spyOn(movebankService, 'fetchSensorData').mockReturnValue(
      of([
        {
          timestamp: '2026-06-01T12:00:00.000Z',
          latitude: 50.0,
          longitude: 10.0,
          acceleration: 1.2,
          temperature: 20.5,
          altitude: 150.0,
        },
      ]),
    );

    // Trigger lifecycle hooks
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(component.rawSensorData().length).toBe(1);
    expect(component.errorMessage()).toBeNull();
  });

  it('should display an error banner and fallback when study fetch fails (500 Error)', async () => {
    // Mock fetch failure for custom study, and successful fallback for default study
    const spy = vi.spyOn(movebankService, 'fetchSensorData').mockImplementation((id) => {
      if (id === 'bad_study') {
        return throwError(() => new Error('Server error 500'));
      }
      return of([
        {
          timestamp: '2026-06-01T12:00:00.000Z',
          latitude: 51.0,
          longitude: 11.0,
          acceleration: 1.0,
          temperature: 18.0,
          altitude: 100.0,
        },
      ]);
    });

    // Set custom study input and trigger load action
    component.studyIdInput.setValue('bad_study');
    component.loadCustomStudy();
    fixture.detectChanges();

    // Verify that error message is set and visible for the user
    expect(component.errorMessage()).toContain('Failed to load Study ID "bad_study"');
    expect(component.studyIdInput.value).toBe('2911040'); // Reverted to default
  });

  it('should allow manual dismissal of the error banner', () => {
    // Force an error message state
    component['showAutoClosingError']('Test error message');
    expect(component.errorMessage()).toBe('Test error message');

    // Manually dismiss the error
    component.dismissError();
    expect(component.errorMessage()).toBeNull();
  });
});
