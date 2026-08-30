import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCard } from './stat-card';
import { MetricSummary } from '../../core/models/sensor.model';

describe('StatCard', () => {
  let fixture: ComponentFixture<StatCard>;
  let component: StatCard;

  const mockMetrics: MetricSummary = {
    min: 10.5,
    max: 95.2,
    avg: 45.8,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCard);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.componentRef.setInput('title', 'Temperature');
    fixture.componentRef.setInput('metrics', mockMetrics);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should correctly bind required and optional signal inputs', () => {
    fixture.componentRef.setInput('title', 'Pressure');
    fixture.componentRef.setInput('unit', 'PSI');
    fixture.componentRef.setInput('metrics', mockMetrics);
    fixture.componentRef.setInput('accentColor', 'var(--secondary)');
    fixture.detectChanges();

    expect(component.title()).toBe('Pressure');
    expect(component.unit()).toBe('PSI');
    expect(component.metrics()).toEqual(mockMetrics);
    expect(component.accentColor()).toBe('var(--secondary)');
  });

  it('should apply default values for optional inputs when not provided', () => {
    fixture.componentRef.setInput('title', 'Humidity');
    fixture.componentRef.setInput('metrics', mockMetrics);
    fixture.detectChanges();

    expect(component.unit()).toBe('');
    expect(component.accentColor()).toBe('var(--primary)');
  });

  it('should render metric values correctly in the template using DecimalPipe', () => {
    fixture.componentRef.setInput('title', 'Voltage');
    fixture.componentRef.setInput('unit', 'V');
    fixture.componentRef.setInput('metrics', mockMetrics);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Voltage');
    expect(compiled.textContent).toContain('45.8');
  });
});
