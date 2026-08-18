import { Service } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { SensorDataPoint } from '../models/sensor.model';

@Service()
export class MovebankService {
  // Declarative signal-based resource replacing traditional Observable HTTP calls
  public readonly sensorStreamsResource = httpResource<SensorDataPoint[]>(
    () => 'data/sensor-streams.json',
    {
      defaultValue: [],
    },
  );
}
