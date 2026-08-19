import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MovebankService } from './movebank.service';

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
    // Verify that there are no outstanding HTTP requests after each test
    httpMock.verify();
  });

  it('should be created successfully', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and parse sensor telemetry data correctly', () => {
    const mockCsvResponse =
      'timestamp\tlocation_lat\tlocation_long\n' +
      '2026-06-01T12:00:00.000Z\t52.52\t13.40\n' +
      '2026-06-01T12:01:00.000Z\t48.13\t11.58';

    let resultData: any = null;

    service.fetchSensorData('12345', 10).subscribe((data) => {
      resultData = data;
    });

    // Expect a GET request to the proxy worker with correct parameters
    const req = httpMock.expectOne(
      (request) =>
        request.url.includes('wispy-surf-c9db.rublin.workers.dev') &&
        request.params.get('study_id') === '12345',
    );

    expect(req.request.method).toBe('GET');

    // Respond with mock CSV text stream
    req.flush(mockCsvResponse);

    expect(resultData).toBeTruthy();
    expect(resultData.length).toBe(2);
    expect(resultData[0].latitude).toBe(52.52);
    expect(resultData[0].longitude).toBe(13.4);
    expect(resultData[0].acceleration).toBeDefined();
    expect(resultData[0].temperature).toBeDefined();
    expect(resultData[0].altitude).toBeDefined();
  });

  it('should handle server or parsing errors and throw an observable error', () => {
    let errorOccurred = false;

    service.fetchSensorData('invalid_id', 10).subscribe({
      next: () => {},
      error: (err) => {
        errorOccurred = true;
        expect(err).toBeTruthy();
      },
    });

    const req = httpMock.expectOne((request) => request.params.get('study_id') === 'invalid_id');

    // Simulate a 500 Internal Server Error
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(errorOccurred).toBe(true);
  });
});
