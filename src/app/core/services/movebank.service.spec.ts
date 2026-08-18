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
      providers: [MovebankService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(MovebankService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched HTTP requests are left pending
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch sensor streams successfully using httpResource', () => {
    // Expect the automatic HTTP request triggered by the resource on initialization
    const req = httpMock.expectOne('data/sensor-streams.json');
    expect(req.request.method).toBe('GET');

    // Mock response payload matching SensorDataPoint[] structure
    const mockSensorData: SensorDataPoint[] = [
      {
        timestamp: new Date().toISOString(),
        latitude: 47.6062,
        longitude: -122.3321,
        acceleration: 1.2,
        temperature: 22.5,
        altitude: 150,
      },
    ];

    req.flush(mockSensorData);

    // Verify that the resource successfully populates its value signal
    expect(service.sensorStreamsResource.value()).toEqual(mockSensorData);
  });
});
