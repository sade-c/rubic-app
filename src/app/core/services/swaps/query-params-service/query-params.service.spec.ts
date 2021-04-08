import { TestBed } from '@angular/core/testing';

import { QueryParamsServiceService } from './query-params.service';

describe('QueryParamsServiceService', () => {
  let service: QueryParamsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryParamsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
