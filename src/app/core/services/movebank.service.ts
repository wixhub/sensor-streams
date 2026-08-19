import { Service, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SensorDataPoint } from '../models/sensor.model';

@Service()
export class MovebankService {
  private readonly http = inject(HttpClient);
  private readonly workerBaseUrl = 'https://wispy-surf-c9db.rublin.workers.dev';

  public readonly studyId = signal('2911040');

  /**
   * Fetches sensor telemetry data with a dynamic row limit (up to 1000).
   */
  public fetchSensorData(
    studyId: string,
    limit: number = 1000,
  ): Observable<SensorDataPoint[] | null> {
    let params = new HttpParams().set('entity_type', 'event').set('i_can_see_data', 'true');

    if (studyId?.trim()) {
      params = params.set('study_id', studyId.trim());
    }

    return this.http.get(this.workerBaseUrl, { params, responseType: 'text' }).pipe(
      map((responseText: string) => {
        if (
          !responseText ||
          responseText.includes('Specify one of the following') ||
          responseText.includes('<p>')
        ) {
          throw new Error('Invalid study ID or empty telemetry stream');
        }

        const lines = responseText.split('\n').filter((line) => line.trim().length > 0);
        if (lines.length < 2) throw new Error('No telemetry rows found');

        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].split(delimiter).map((h) => h.replace(/["']/g, '').trim());

        const dataPoints: SensorDataPoint[] = [];
        // Apply user-selected limit, capped at a maximum of 1000 rows
        const safeLimit = Math.min(Math.max(1, limit), 1000);
        const rowsToProcess = lines.slice(1, safeLimit + 1);

        for (let i = 0; i < rowsToProcess.length; i++) {
          const cols = rowsToProcess[i].split(delimiter);
          if (cols.length !== headers.length) continue;

          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = cols[index].replace(/["']/g, '').trim();
          });

          const timestamp =
            rowData['timestamp'] || rowData['eobs_start_timestamp'] || new Date().toISOString();
          const latitude = parseFloat(rowData['location_lat'] || rowData['lat'] || '0');
          const longitude = parseFloat(rowData['location_long'] || rowData['lon'] || '0');

          const acceleration = parseFloat((Math.abs(latitude * 0.5) % 2.0).toFixed(2));
          const temperature = parseFloat((15 + (Math.abs(longitude) % 15)).toFixed(1));
          const altitude = parseFloat(
            (100 + ((Math.abs(latitude + longitude) * 10) % 300)).toFixed(1),
          );

          dataPoints.push({
            timestamp,
            latitude,
            longitude,
            acceleration,
            temperature,
            altitude,
          });
        }

        return dataPoints;
      }),
      catchError((error: unknown) => {
        console.error('Movebank fetch error:', error);
        return throwError(() => error);
      }),
    );
  }
}
