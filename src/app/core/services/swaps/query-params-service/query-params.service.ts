import { query } from '@angular/animations';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TradeTypeService } from '../trade-type-service/trade-type.service';

interface QueryParams {
  from?: string;
  to?: string;
  amount?: string;
  mode?: string;
  chain?: string;
}
@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  private _querySubscription$: Subscription;

  public fromToken: String;

  public toToken: String;

  public blockchain: String;

  public mode: String;

  public queryParams: QueryParams;

  private defaultQueryParams: { ETH: QueryParams; BSC: QueryParams };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly tradeTypeService: TradeTypeService
  ) {}

  public setupDefaultParams(): void {
    this.defaultQueryParams = {
      ETH: {
        from: 'ETH',
        to: 'RBC',
        chain: 'ETH',
        amount: '1'
      },
      BSC: {
        from: 'BNB',
        to: 'BRBC',
        chain: 'BSC',
        amount: '1'
      }
    };
    const queryParams = this.route.snapshot.queryParams as QueryParams;
    this.tradeTypeService
      .getBlockchain()
      .pipe(take(2))
      .subscribe(blockchain => {
        if (blockchain) {
          if (queryParams.from || queryParams.to) {
            if (queryParams.chain) {
              if (queryParams.chain === 'ETH') {
                this.queryParams = this.defaultQueryParams.ETH;
              } else {
                this.queryParams = this.defaultQueryParams.BSC;
              }
            } else {
              this.queryParams = this.defaultQueryParams.BSC;
            }
          }
        }
      });
  }

  public setParam(key: string, value: string): void {
    this.queryParams[key] = value;
  }

  public navigateByParams(): void {
    this.router.navigate([], {
      queryParams: this.queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
