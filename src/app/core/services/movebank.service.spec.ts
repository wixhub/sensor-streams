import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MovebankService } from './movebank.service';
import { SensorDataPoint } from '../models/sensor.model';

describe('MovebankService', () => {
  let service: MovebankService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MovebankService,
        provideHttpClient(),
        provideHttpClientTesting(), // Setup for mocking HttpClient requests
      ],
    });

    service = TestBed.inject(MovebankService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Ensure no outstanding requests remain after each test
  afterEach(() => {
    httpMock.verify();
  });

  // Test 1: Verify the service is created
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test 2: Verify getSensorStreams returns the expected data
  it('should fetch sensor streams successfully', () => {
    const mockData: SensorDataPoint[] = [
      {
        timestamp: '2026-08-16T17:30:00Z',
        latitude: 47.65,
        longitude: 9.47,
        acceleration: 1.2,
        temperature: 22.5,
        altitude: 400,
      },
    ];

    service.getSensorStreams().subscribe((data) => {
      expect(data).toEqual(mockData);
      expect(data.length).toBe(1);
    });

    // Check that the request was made to the correct URL and method
    const req = httpMock.expectOne('data/sensor-streams.json');
    expect(req.request.method).toBe('GET');

    // Respond with the mock data
    req.flush(mockData);
  });

  // Test 3: Handle HTTP error scenarios
  it('should handle errors when fetching data fails', () => {
    service.getSensorStreams().subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne('data/sensor-streams.json');
    req.flush('Failed to fetch', { status: 404, statusText: 'Not Found' });
  });
});
