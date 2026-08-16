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
  // Required signal input for the card title
  readonly title = input.required<string>();

  // Optional signal input for the unit of measurement
  readonly unit = input<string>('');

  // Required signal input containing min, max, and avg values
  readonly metrics = input.required<MetricSummary>();

  // Optional signal input for styling accent color with a default value
  readonly accentColor = input<string>('var(--primary)');
}
