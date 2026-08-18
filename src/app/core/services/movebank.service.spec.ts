import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MovebankService } from './movebank.service';

describe('MovebankService', () => {
  let service: MovebankService;
  let httpMock: HttpTestingController;

  // Setup testing module before each test case
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MovebankService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(MovebankService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Ensure no unmatched requests are left over after each test
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and parse sensor data successfully from valid TSV response', () => {
    // Mock TSV response text mirroring Movebank output format
    const mockTsvResponse =
      'timestamp\tlocation_lat\tlocation_long\n' +
      '2026-06-01T12:00:00Z\t52.5200\t13.4050\n' +
      '2026-06-01T12:01:00Z\t51.5074\t-0.1278\n';

    let resultData: any = null;

    // Trigger the service method and subscribe to the observable
    service.fetchSensorData('2911040').subscribe({
      next: (data) => {
        resultData = data;
      },
      error: (err) => {
        // Use an explicit assertion to fail the test in Vitest
        expect.soft(err).toBeUndefined();
      },
    });

    // Expect an outgoing HTTP GET request to the worker URL with required query parameters
    const req = httpMock.expectOne(
      (request) => request.url === 'https://wispy-surf-c9db.rublin.workers.dev',
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('study_id')).toBe('2911040');

    // Flush the mock response back down through the stream
    req.flush(mockTsvResponse);

    // Assertions on the parsed data points mapped inside the service
    expect(resultData).not.toBeNull();
    expect(resultData.length).toBe(2);
    expect(resultData[0].latitude).toBe(52.52);
    expect(resultData[0].longitude).toBe(13.405);
    expect(resultData[0].timestamp).toBe('2026-06-01T12:00:00Z');

    // Check computed fields mapping logic
    expect(typeof resultData[0].acceleration).toBe('number');
    expect(typeof resultData[0].temperature).toBe('number');
  });

  it('should handle errors when response contains error message text or HTML', () => {
    const invalidHtmlResponse = '<html><p>Specify one of the following parameters...</p></html>';
    let capturedError: any = null;

    service.fetchSensorData('invalid_id').subscribe({
      next: () => {
        // Explicitly fail if success block is incorrectly reached
        expect.soft(true).toBeFalsy();
      },
      error: (error) => {
        capturedError = error;
      },
    });

    const req = httpMock.expectOne(
      (request) => request.url === 'https://wispy-surf-c9db.rublin.workers.dev',
    );

    // Simulate server response with error body pattern handled by the service
    req.flush(invalidHtmlResponse);

    expect(capturedError).toBeTruthy();
    expect(capturedError.message).toContain('Invalid study ID or empty telemetry stream');
  });
});
