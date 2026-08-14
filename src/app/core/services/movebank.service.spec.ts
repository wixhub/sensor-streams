import { TestBed } from '@angular/core/testing';

import { MovebankService } from './movebank.service';

describe('MovebankService', () => {
  let service: MovebankService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovebankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
