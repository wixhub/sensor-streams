import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // Provide an empty router configuration since the component imports RouterOutlet
      providers: [provideRouter([])],
    }).compileComponents();
  });

  // Verify that the component is created successfully
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Verify that the component instance is an instance of the App class
  it('should be an instance of App', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app instanceof App).toBeTruthy();
  });

  // Verify that the RouterOutlet is rendered in the template
  it('should render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).not.toBeNull();
  });
});
