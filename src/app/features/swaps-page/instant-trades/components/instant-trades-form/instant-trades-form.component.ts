import { Component, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { UniSwapService } from 'src/app/features/swaps-page/instant-trades/services/uni-swap-service/uni-swap.service';
import BigNumber from 'bignumber.js';
import InstantTradeService from 'src/app/features/swaps-page/instant-trades/services/InstantTradeService';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { QueryParamsService } from 'src/app/core/services/swaps/query-params-service/query-params.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import InstantTrade from '../../models/InstantTrade';
import InstantTradeToken from '../../models/InstantTradeToken';
import { OneInchEthService } from '../../services/one-inch-service/one-inch-eth-service/one-inch-eth.service';
import { OneInchBscService } from '../../services/one-inch-service/one-inch-bsc-service/one-inch-bsc.service';
import { MessageBoxComponent } from '../../../../../shared/components/message-box/message-box.component';
import { RubicError } from '../../../../../shared/models/errors/RubicError';
import { NetworkError } from '../../../../../shared/models/errors/provider/NetworkError';
import { NetworkErrorComponent } from '../../../../bridge-page/components/network-error/network-error.component';
import ADDRESS_TYPE from '../../../../../shared/models/blockchain/ADDRESS_TYPE';
import { InstantTradesApiService } from '../../../../../core/services/backend/instant-trades-api/instant-trades-api.service';
import { MetamaskError } from '../../../../../shared/models/errors/provider/MetamaskError';
import { PancakeSwapService } from '../../services/pancake-swap-service/pancake-swap.service';
import { Token } from '../../../../../shared/models/tokens/Token';

interface TradeProviderInfo {
  label: string;
}

interface InstantTradeParameters {
  fromAmount: string;
  fromToken: SwapToken;
  toToken: SwapToken;

  isCustomFromTokenFormOpened: boolean;
  isCustomToTokenFormOpened: boolean;
  customFromTokenAddress: string;
  customToTokenAddress: string;
}

interface InstantTradeProviderController {
  trade: InstantTrade;
  tradeState: TRADE_STATUS;
  tradeProviderInfo: TradeProviderInfo;
  isBestRate: boolean;
}

enum TRADE_STATUS {
  CALCULATION = 'CALCULATION',
  APPROVAL = 'APPROVAL',
  TX_IN_PROGRESS = 'TX_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

@Component({
  selector: 'app-instant-trades-form',
  templateUrl: './instant-trades-form.component.html',
  styleUrls: ['./instant-trades-form.component.scss']
})
export class InstantTradesFormComponent implements OnInit, OnDestroy {
  private _blockchainSubscription$: Subscription;

  private _setBlockchainSubsctiption$: Subscription;

  private _setTokensSubscription$: Subscription;

  private _instantTradeServices: InstantTradeService[];

  private _tradeParameters: InstantTradeParameters;

  private _tokens = List<SwapToken>([]);

  private _tokensSubscription$: Subscription;

  public blockchain: BLOCKCHAIN_NAME;

  public TRADE_STATUS = TRADE_STATUS;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public availableFromTokens = List<SwapToken>([]);

  public availableToTokens = List<SwapToken>([]);

  public trades: InstantTradeProviderController[];

  public selectedTradeState: TRADE_STATUS;

  public transactionHash: string;

  public customToken = {
    from: {} as SwapToken,
    to: {} as SwapToken
  };

  get tokens(): List<SwapToken> {
    return this._tokens;
  }

  set tokens(value: List<SwapToken>) {
    this._tokens = value.filter(token => token.blockchain === this.blockchain);
    this.availableToTokens = this._tokens.concat();
    this.availableFromTokens = this._tokens.concat();
  }

  get tradeParameters(): InstantTradeParameters {
    return this._tradeParameters;
  }

  set tradeParameters(value) {
    if (
      this._tradeParameters.fromToken?.address === value.fromToken?.address &&
      this._tradeParameters.fromAmount === value.fromAmount &&
      this._tradeParameters.toToken?.address === value.toToken?.address
    ) {
      this._tradeParameters = value;
      const toAmount = this.trades
        .find(tradeController => tradeController.isBestRate)
        ?.trade?.to?.amount.toFixed();

      this.tradeParametersService.setTradeParameters(this.blockchain, {
        ...this._tradeParameters,
        toAmount
      });
      return;
    }

    this._tradeParameters = value;

    this.tradeParametersService.setTradeParameters(this.blockchain, {
      ...this._tradeParameters,
      toAmount: null
    });

    this.trades = this.trades.map(tradeController => ({
      ...tradeController,
      isBestRate: false
    }));

    if (
      value.fromAmount &&
      !new BigNumber(value.fromAmount).isNaN() &&
      value.fromToken &&
      value.toToken
    ) {
      this.calculateTradeParameters();
    } else {
      this.trades = this.trades.map(tradeController => ({
        ...tradeController,
        trade: null,
        tradeState: null
      }));
    }
  }

  get fromToken(): SwapToken {
    return this.tradeParameters.fromToken;
  }

  set fromToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromToken: value
    };

    if (this.fromToken) this.navigateByParam('from', this.fromToken.symbol);

    this.availableToTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get toToken(): SwapToken {
    return this.tradeParameters.toToken;
  }

  set toToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      toToken: value
    };

    if (this.toToken) this.navigateByParam('to', this.toToken.symbol)

    this.availableFromTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get fromAmount(): string {
    return this.tradeParameters.fromAmount;
  }

  set fromAmount(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromAmount: value
    };

    this.navigateByParam('amount', value);
  }

  get fromAmountAsNumber(): BigNumber {
    return new BigNumber(this.tradeParameters.fromAmount);
  }

  constructor(
    private tradeTypeService: TradeTypeService,
    private tradeParametersService: TradeParametersService,
    private tokensService: TokensService,
    private uniSwapService: UniSwapService,
    private oneInchEthService: OneInchEthService,
    private onInchBscService: OneInchBscService,
    private pancakeSwapService: PancakeSwapService,
    private dialog: MatDialog,
    private instantTradesApiService: InstantTradesApiService,
    private router: Router,
    private queryParamsService: QueryParamsService,
    private web3Service: Web3PublicService,
  ) {}

  private initInstantTradeProviders() {
    switch (this.blockchain) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        this._instantTradeServices = [this.oneInchEthService, this.uniSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: '1inch'
            },
            isBestRate: false
          },
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Uniswap'
            },
            isBestRate: false
          }
        ];
        break;
      case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
        this._instantTradeServices = [this.onInchBscService, this.pancakeSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: '1inch'
            },
            isBestRate: false
          },
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Pancakeswap'
            },
            isBestRate: false
          }
        ];
        break;
      default:
        console.log(`Blockchain ${this.blockchain} was not found.`);
    }
  }

  ngOnInit() {
    this.queryParamsService.setupDefaultParams();
    this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
      this.tokens = tokens;
    });

    this._setTokensSubscription$ = this.tokensService.tokens.pipe(take(2)).subscribe(tokens => {
      if (tokens.size > 0 && this.queryParamsService.queryParams) {
        const fromQuery = this.queryParamsService.queryParams?.from;
        const toQuery = this.queryParamsService.queryParams?.to;

        if (this.isAddressQuery(fromQuery)) {
          this.fromToken = this.searchTokenByAddress(fromQuery);
          if (!this.fromToken) {
            this.getCustomToken(fromQuery).then(res => {
              this.fromToken = res;
              this.navigateByParam('from', this.fromToken.address);
            })
          };
        }

        if (this.isAddressQuery(toQuery)) {
          this.toToken = this.searchTokenByAddress(toQuery);
          if (!this.toToken) {
            this.getCustomToken(toQuery).then(res => {
              this.toToken = res;
              this.navigateByParam('to', this.toToken.address);
            })
          }
        }

        if (!this.isAddressQuery(fromQuery)) this.fromToken = this.searchTokenBySymbol(this.queryParamsService.queryParams.from);
        if (!this.isAddressQuery(toQuery)) this.toToken = this.searchTokenBySymbol(this.queryParamsService.queryParams.to);
      }
    });

    this._blockchainSubscription$ = this.tradeTypeService.getBlockchain().subscribe(blockchain => {
      this.blockchain = blockchain;

      if (blockchain) {
        this.queryParamsService.setParam('chain', blockchain);
        this.queryParamsService.navigateByParams();
      }

      this.initInstantTradeProviders();

      this.tokens = this.tokensService.tokens.getValue();
      const tradeParameters = this.tradeParametersService.getTradeParameters(this.blockchain);

      this._tradeParameters = {
        ...tradeParameters,
        fromToken: null,
        toToken: null,
        fromAmount: null
      };

      this.fromToken = tradeParameters?.fromToken;
      this.toToken = tradeParameters?.toToken;
      this.fromAmount = tradeParameters?.fromAmount;
    });

    this._setBlockchainSubsctiption$ = this.tradeTypeService
      .getBlockchain()
      .pipe(take(2))
      .subscribe(blockchain => {
        if (blockchain && this.queryParamsService.queryParams?.chain)
          this.tradeTypeService.setBlockchain(
            this.queryParamsService.queryParams.chain as BLOCKCHAIN_NAME
          );
      });

    if (this.queryParamsService.queryParams?.amount) this.fromAmount = this.queryParamsService.queryParams.amount;
  }

  ngOnDestroy() {
    this._tokensSubscription$.unsubscribe();
    this._blockchainSubscription$.unsubscribe();
    this._setBlockchainSubsctiption$.unsubscribe();
  }

  private isCalculatedTradeActual(
    fromAmount: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ) {
    return (
      this._tradeParameters.fromToken?.address === fromToken?.address &&
      new BigNumber(this._tradeParameters.fromAmount).isEqualTo(fromAmount) &&
      this._tradeParameters.toToken?.address === toToken?.address
    );
  }

  public revertTokens() {
    const { fromToken, toToken } = this.tradeParameters;
    const toAmount = this.trades[0].trade?.to?.amount.toFixed();
    this.fromToken = toToken;
    this.toToken = fromToken;

    this.tradeParameters = {
      ...this.tradeParameters,
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: toAmount
    };
  }

  public getToAmount(providerIndex: number): string {
    const to = this.trades[providerIndex]?.trade?.to;
    return to ? to.amount.toFixed(to.token.decimals) : '';
  }

  public checkIfError(providerIndex: number): boolean {
    return this.trades[providerIndex].tradeState === TRADE_STATUS.ERROR;
  }

  public shouldAnimateButton(providerIndex: number) {
    const { tradeState } = this.trades[providerIndex];
    return tradeState && tradeState !== TRADE_STATUS.ERROR && tradeState !== TRADE_STATUS.COMPLETED;
  }

  private async calculateTradeParameters() {
    const tradeParams = {
      ...this.tradeParameters
    };
    const calculationPromises: Promise<void>[] = [];
    this._instantTradeServices.forEach((service, index) =>
      calculationPromises.push(this.calculateProviderTrade(service, this.trades[index]))
    );
    await Promise.allSettled(calculationPromises);
    if (
      this.isCalculatedTradeActual(
        tradeParams.fromAmount,
        tradeParams.fromToken,
        tradeParams.toToken
      )
    ) {
      this.calculateBestRate();
      const toAmount = this.trades
        .find(tradeController => tradeController.isBestRate)
        ?.trade?.to?.amount.toFixed();
      this.tradeParametersService.setTradeParameters(this.blockchain, {
        ...this.tradeParameters,
        toAmount
      });
    }
  }

  private async calculateProviderTrade(
    service: InstantTradeService,
    tradeController: InstantTradeProviderController
  ): Promise<void> {
    tradeController.trade = null;
    tradeController.tradeState = TRADE_STATUS.CALCULATION;
    try {
      const calculatedTrade = await service.calculateTrade(
        new BigNumber(this.tradeParameters.fromAmount),
        this.fromToken,
        this.toToken
      );
      if (!calculatedTrade) {
        tradeController.trade = null;
        tradeController.tradeState = TRADE_STATUS.ERROR;
        return;
      }
      if (
        this.isCalculatedTradeActual(
          calculatedTrade.from.amount.toFixed(),
          calculatedTrade.from.token,
          calculatedTrade.to.token
        )
      ) {
        tradeController.trade = calculatedTrade;
        tradeController.tradeState = null;
      }
    } catch (error) {
      console.error(error);
      tradeController.trade = null;
      tradeController.tradeState = TRADE_STATUS.ERROR;
    }
  }

  private calculateBestRate(): void {
    this.trades = this.trades.map(tradeController => ({
      ...tradeController,
      isBestRate: false
    }));

    let bestRateProviderIndex;
    let bestRateProviderProfit = new BigNumber(-Infinity);
    this.trades.forEach((tradeController, index) => {
      if (tradeController.trade) {
        const { gasFeeInUsd, to } = tradeController.trade;
        const toToken = this.tokens.find(token => token.address === to.token.address);
        const amountInUsd = to.amount?.multipliedBy(toToken.price);

        if (amountInUsd && gasFeeInUsd) {
          const profit = amountInUsd.minus(gasFeeInUsd);
          if (profit.gt(bestRateProviderProfit)) {
            bestRateProviderProfit = profit;
            bestRateProviderIndex = index;
          }
        }
      }
    });

    if (bestRateProviderIndex !== undefined) {
      this.trades[bestRateProviderIndex] = {
        ...this.trades[bestRateProviderIndex],
        isBestRate: true
      };
    }
  }

  public setIsCustomTokenFormOpened(part: 'from' | 'to', isOpened: boolean): void {
    if (part === 'from') {
      this.tradeParameters = {
        ...this.tradeParameters,
        isCustomFromTokenFormOpened: isOpened
      };
    } else {
      this.tradeParameters = {
        ...this.tradeParameters,
        isCustomToTokenFormOpened: isOpened
      };
    }
  }

  public setCustomTokenAddress(part: 'from' | 'to', address: string): void {
    if (part === 'from') {
      this.tradeParameters = {
        ...this.tradeParameters,
        customFromTokenAddress: address
      };
    } else {
      this.tradeParameters = {
        ...this.tradeParameters,
        customToTokenAddress: address
      };
    }
  }

  public updateCustomToken(part: 'from' | 'to', tokenBody: Token): void {
    const token = this.tokens.find(
      t => t.address.toLowerCase() === tokenBody.address.toLowerCase()
    );
    this.customToken[part] = token ? { ...token } : { ...this.customToken[part], ...tokenBody };
  }

  public addCustomToken(part: 'from' | 'to'): void {
    if (part === 'from') {
      this.fromToken = { ...this.customToken.from };
      this.navigateByParam('from', this.fromToken.address);
    } else {
      this.toToken = { ...this.customToken.to };
      this.navigateByParam('from', this.toToken.address);
    }
  }

  public isAnyTokenCustom(): boolean {
    return (
      (this.fromToken &&
        !this.tokens.find(
          t => t?.address.toLowerCase() === this.fromToken.address.toLowerCase()
        )) ||
      (this.toToken &&
        !this.tokens.find(t => t.address.toLowerCase() === this.toToken.address.toLowerCase()))
    );
  }

  public createTrade(selectedServiceIndex: number) {
    const setTradeState = (state: TRADE_STATUS) => {
      this.trades[selectedServiceIndex].tradeState = state;
      this.selectedTradeState = state;
    };
    this._instantTradeServices[selectedServiceIndex]
      .createTrade(this.trades[selectedServiceIndex].trade, {
        onApprove: () => setTradeState(TRADE_STATUS.APPROVAL),
        onConfirm: () => setTradeState(TRADE_STATUS.TX_IN_PROGRESS)
      })
      .then(receipt => {
        setTradeState(TRADE_STATUS.COMPLETED);
        this.transactionHash = receipt.transactionHash;
        this.instantTradesApiService.notifyInstantTradesBot({
          provider: this.trades[selectedServiceIndex].tradeProviderInfo.label,
          blockchain: this.blockchain,
          walletAddress: receipt.from,
          trade: this.trades[selectedServiceIndex].trade,
          txHash: receipt.transactionHash
        });
      })
      .catch((err: RubicError) => {
        let data: any = { title: 'Error', descriptionText: err.comment };
        if (err instanceof MetamaskError) {
          data.title = 'Warning';
        }
        if (err instanceof NetworkError) {
          data = {
            title: 'Error',
            descriptionComponentClass: NetworkErrorComponent,
            descriptionComponentInputs: { networkError: err }
          };
        }
        this.dialog.open(MessageBoxComponent, {
          width: '400px',
          data
        });
      });
  }

  public onCloseModal() {
    this.trades.map(trade => ({ ...trade, tradeState: null }));
    this.selectedTradeState = null;
    this.transactionHash = undefined;
  }

  public isAddressQuery = str => str.length > 0 && str.slice(0, 2) === '0x';

  public searchTokenByAddress = queryParam => {
    return this.availableFromTokens.find(
      token => token.address.toLowerCase() === queryParam.toLowerCase()
    );
  };

  public searchTokenBySymbol = queryParam => {
    return this.availableFromTokens.find(
      token =>
        token.symbol.toLowerCase() === queryParam.toLowerCase() ||
        token.symbol.toLowerCase() === queryParam.toLowerCase()
    );
  };

  public navigateByParam = (part: any, param: String) => {

    this.router.navigate([], {
      queryParams: {
        [part]: param
      },
      queryParamsHandling: 'merge'
    });
  }

  public getCustomToken = (query: String) => {
    return this.web3Service[this.blockchain].getTokenInfo(query).then((token: Token) => ({
      blockchain: undefined,
      image: undefined,
      rank: undefined,
      price: undefined,
      used_in_iframe: undefined,
      ...token,
    }))
  }
}