import { Component, input } from '@angular/core';
import { MetricSummary } from '../../core/models/sensor.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  imports: [DecimalPipe],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  title = input.required<string>();
  unit = input<string>('');
  metrics = input.required<MetricSummary>();
  accentColor = input<string>('var(--primary)');
}
