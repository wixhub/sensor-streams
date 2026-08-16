import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  let component: StatCard;
  let fixture: ComponentFixture<StatCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCard);
    component = fixture.componentInstance;

    // Set required signal inputs before triggering initial change detection
    fixture.componentRef.setInput('title', 'Temperature');
    fixture.componentRef.setInput('metrics', { min: 10.5, max: 30.2, avg: 20.1 });

    fixture.detectChanges();
  });

  // Verify component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Verify that required inputs and optional unit are rendered correctly
  it('should render title, unit, and formatted metrics', async () => {
    // Provide a unit input as well
    fixture.componentRef.setInput('unit', '°C');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const header = compiled.querySelector('.card-header');
    expect(header?.textContent).toContain('Temperature');

    const values = compiled.querySelectorAll('.metric-item .value');
    expect(values.length).toBe(3);

    // Check formatted values and unit presence using DecimalPipe ('1.1-1')
    expect(values[0].textContent).toContain('10.5 °C');
    expect(values[1].textContent).toContain('20.1 °C');
    expect(values[2].textContent).toContain('30.2 °C');
  });

  // Test 3: Verify accent color is applied to the border style
  it('should apply accent color to the border-left style', () => {
    fixture.componentRef.setInput('accentColor', 'rgb(255, 0, 0)');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.stat-card') as HTMLElement;

    expect(card.style.borderLeft).toContain('4px solid rgb(255, 0, 0)');
  });
});
