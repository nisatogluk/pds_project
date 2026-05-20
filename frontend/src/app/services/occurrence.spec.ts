import { TestBed } from '@angular/core/testing';

import { Occurrence } from './occurrence';

describe('Occurrence', () => {
  let service: Occurrence;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Occurrence);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
