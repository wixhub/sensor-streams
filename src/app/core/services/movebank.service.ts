import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SensorDataPoint } from '../models/sensor.model';

@Injectable({
  providedIn: 'root',
})
export class MovebankService {
  private http = inject(HttpClient);

  getSensorStreams(): Observable<SensorDataPoint[]> {
    return this.http.get<SensorDataPoint[]>('data/sensor-streams.json');
  }
}
