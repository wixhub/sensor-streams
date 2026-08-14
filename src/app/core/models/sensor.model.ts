export interface SensorDataPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  acceleration: number;
  temperature: number;
  altitude: number;
}

export interface MetricSummary {
  min: number;
  max: number;
  avg: number;
}
