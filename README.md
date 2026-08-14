# Multi-Dimensional Sensor Streams Dashboard

A production-grade scientific dashboard designed for visualizing complex multi-dimensional animal tracking and environmental telemetry streams sourced from **Movebank**. Built using **Angular 22** featuring native Signals, stable Zoneless architecture, and modern reactive forms.

## 🚀 Live Demo

🔗 **[View Live Application on Cloudflare Pages](https://sensor-streams.pages.dev)**

## Key Features

1. **Zoneless & Signal-Powered**: Fully optimized for Angular 22 reactivity standards, executing performant computed state updates without Zone.js overhead.

2. **Synchronized Time-Series Charting**: Integrated multi-axis graphs handling high-frequency sensor streams (Acceleration and Temperature) via Chart.js.

3. **Responsive Grid Layouts**: Fluid layout mechanism featuring CSS grid and custom SCSS mixins that reflow seamlessly from multi-column desktop monitors down to mobile single-column layouts.

4. **Adaptive Statistical Cards**: Real-time evaluation of sensor arrays displaying precise minimum, maximum, and average indicators.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Project Structure

```text
sensor-streams/
├── public/
│   └── data/
│       └── sensor-streams.json
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   └── movebank.service.ts
│   │   │   └──  models/
│   │   │       └── sensor.model.ts
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.scss
│   │   │   │   └── dashboard.component.html
│   │   │   ├── stat-card/
│   │   │   │   ├── stat-card.component.ts
│   │   │   │   └── stat-card.component.scss
│   │   │   └── sensor-chart/
│   │   │       ├── sensor-chart.component.ts
│   │   │       └── sensor-chart.component.scss
│   │   ├── app.config.ts
│   │   ├── app.component.ts
│   │   └── app.component.html
│   ├── styles.scss
│   └── main.ts
├── angular.json
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v22+ recommended)
- Angular CLI 22+

### Installation & Run

```bash
# Clone repository
git clone https://github.com/wixhub/sensor-streams.git

cd sensor-streams

# Install dependencies
npm install

# Run development server
ng serve
```

Navigate to http://localhost:4200/. The application will automatically reload if you change any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
