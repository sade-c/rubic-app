import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { QueryParamsService } from 'src/app/core/services/swaps/query-params-service/query-params.service';
import { TRADE_MODE } from '../../../trades-module/models';
import { TradeTypeService } from '../../../../../core/services/swaps/trade-type-service/trade-type.service';

@Component({
  selector: 'app-swaps-page',
  templateUrl: './swaps-page.component.html',
  styleUrls: ['./swaps-page.component.scss']
})
export class SwapsPageComponent implements OnInit, OnDestroy {
  private _selectedMode: TRADE_MODE;

  private _modeSubscription$: Subscription;

  private _setModeSubscription$: Subscription;

  public TRADE_MODE = TRADE_MODE;

  get selectedMode(): TRADE_MODE {
    return this._selectedMode;
  }

  set selectedMode(value) {
    this._selectedMode = value;
    this.tradeTypeService.setMode(value);
  }

  constructor(
    private tradeTypeService: TradeTypeService,
    private queryParams: QueryParamsService,
    private router: Router
) {}

  ngOnInit() {
    this._modeSubscription$ = this.tradeTypeService.getMode().subscribe(mode => {
      this._selectedMode = mode;

      if (this._selectedMode) {
        this.router.navigate([], {
          queryParams: {
            mode: this._selectedMode,
          },
          queryParamsHandling: 'merge'
        });
      }
    });

    this._setModeSubscription$ = this.tradeTypeService
      .getMode()
      .pipe(take(1))
      .subscribe(mode => {
        if (this.queryParams.mode) {
          this.tradeTypeService.setMode(this.queryParams.mode as TRADE_MODE);
        }
      });
  }

  ngOnDestroy() {
    this._modeSubscription$.unsubscribe();
  }
}
