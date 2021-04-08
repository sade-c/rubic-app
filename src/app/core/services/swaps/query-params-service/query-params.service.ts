import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// interface QueryParams {
//   fromToken: String,
//   toToken: String,
//   blockchain: String,
//   mode: String,
// }

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {

  private _querySubscription$: Subscription;

  //public queries: QueryParams;

  public fromToken: String;

  public toToken: String;

  public blockchain: String;

  public mode: String;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this._querySubscription$ = route.queryParams.subscribe((queryParam: any) => {
      this.fromToken = queryParam['fromToken'];
      this.toToken = queryParam['toToken'];
      this.blockchain = queryParam['blockchain'];
      this.mode = queryParam['mode'];
    });
  }
}
