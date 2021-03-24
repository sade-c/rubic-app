import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import BigNumber from 'bignumber.js';

import { BridgeService } from 'src/app/features/bridge-page/services/bridge.service';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NetworkErrorComponent } from '../network-error/network-error.component';
import InputToken from '../../../../shared/models/tokens/InputToken';
import { BridgeToken } from '../../models/BridgeToken';
import { BridgeBlockchain } from '../../models/BridgeBlockchain';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { MessageBoxComponent } from '../../../../shared/components/message-box/message-box.component';

@Component({
  selector: 'app-bridge-form',
  templateUrl: './bridge-form.component.html',
  styleUrls: ['./bridge-form.component.scss']
})
export class BridgeFormComponent implements OnInit, OnDestroy {
  public Blockchains = {
    Ethereum: {
      name: BLOCKCHAIN_NAME.ETHEREUM,
      shortLabel: 'Ethereum',
      label: 'Ethereum',
      img: 'eth.png',
      baseUrl: 'https://etherscan.io',
      addressBaseUrl: 'https://etherscan.io/address/',
      scanner: {
        label: 'Etherscan',
        baseUrl: 'https://etherscan.io/token/'
      },
      symbolName: 'ethSymbol',
      decimalsName: 'ethContractDecimal',
      addressName: 'ethContractAddress'
    },
    Binance: {
      name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      shortLabel: 'Binance Smart Chain',
      label: 'Binance Smart Chain',
      img: 'bnb.svg',
      baseUrl: 'https://bscscan.com',
      addressBaseUrl: 'https://bscscan.com/address/',
      scanner: {
        label: 'BSCscan',
        baseUrl: 'https://bscscan.com/token/'
      },
      symbolName: 'bscSymbol',
      decimalsName: 'bscContractDecimal',
      addressName: 'bscContractAddress'
    }
  };

  public blockchainsList: BridgeBlockchain[] = Object.values(this.Blockchains);

  private _fromBlockchain = this.Blockchains.Ethereum;

  private _toBlockchain = this.Blockchains.Binance;

  private _tokens: List<BridgeToken> = List([]);

  public dropDownTokens: List<InputToken> = List([]);

  public _selectedToken: BridgeToken = null;

  public selectedTokenAsInputToken: InputToken = null;

  public _fromNumber: BigNumber;

  private _fee: BigNumber;

  public _toNumber: BigNumber;

  public feeCalculationProgress: boolean = false;

  public buttonAnimation: boolean = false;

  public tradeInProgress: boolean = false;

  public tradeSuccessId: string;

  public fromWalletAddress: string;

  public toWalletAddress: string;

  public isAdvancedSectionShown = false;

  private smallMobileWidth = 410;

  private tokensSubscription$: Subscription;

  private addressSubscription$: Subscription;

  get tokens(): List<BridgeToken> {
    return this._tokens;
  }

  set tokens(tokens: List<BridgeToken>) {
    this._tokens = tokens;
    this.updateDropDownTokens();
  }

  private updateDropDownTokens(): void {
    this.dropDownTokens = this._tokens.map(token => ({
      address: token[this.fromBlockchain.addressName],
      name: token.name,
      symbol: token[this.fromBlockchain.symbolName],
      image: token.icon,
      decimals: token[this.fromBlockchain.decimalsName]
    }));
  }

  get selectedToken(): BridgeToken {
    return this._selectedToken;
  }

  set selectedToken(value: BridgeToken) {
    this._selectedToken = value;
    this.selectedTokenAsInputToken = this.dropDownTokens.find(
      token => token.address === this.selectedToken[this.fromBlockchain.addressName]
    );
  }

  get fromBlockchain() {
    return this._fromBlockchain;
  }

  set fromBlockchain(blockchain) {
    if (blockchain === this._toBlockchain) {
      this.revertBlockchains();
    } else {
      this._fromBlockchain = blockchain;
    }
    this.updateDropDownTokens();
  }

  get toBlockchain() {
    return this._toBlockchain;
  }

  set toBlockchain(blockchain) {
    if (blockchain === this._fromBlockchain) {
      this.revertBlockchains();
    } else {
      this._toBlockchain = blockchain;
      this.updateDropDownTokens();
    }
  }

  set fromNumber(fromNumber: BigNumber) {
    this._fromNumber = fromNumber;
    this.setToNumber();
  }

  get fromNumber(): BigNumber {
    return this._fromNumber;
  }

  set fee(fee: BigNumber) {
    this._fee = fee;
    this.setToNumber();
  }

  get fee(): BigNumber {
    return this._fee;
  }

  get toNumber(): string {
    if (this._toNumber === undefined || null) {
      return '';
    }

    let amount = this._toNumber.toString();

    if (amount.includes('.')) {
      const startIndex = amount.indexOf('.') + 1;
      amount = amount.slice(0, startIndex + this.selectedToken[this.toBlockchain.decimalsName]);
    }

    return amount;
  }

  private setToNumber(): void {
    if (this.fromNumber !== undefined && this.fee !== undefined) {
      this._toNumber = this.fromNumber.minus(this.fee);
    } else {
      this._toNumber = undefined;
    }
  }

  constructor(private bridgeService: BridgeService, private dialog: MatDialog) {
    bridgeService.tokens.subscribe(tokens => {
      this.tokens = tokens;
    });
  }

  ngOnInit() {
    this.setBlockchainLabelName();
    this.tokensSubscription$ = this.bridgeService.tokens.subscribe(tokens => {
      this.tokens = tokens;
    });
    this.addressSubscription$ = this.bridgeService.walletAddress.subscribe(address => {
      this.fromWalletAddress = address;
      this.toWalletAddress = address;
    });
  }

  ngOnDestroy() {
    this.tokensSubscription$.unsubscribe();
    this.addressSubscription$.unsubscribe();
  }

  public revertBlockchains() {
    [this._fromBlockchain, this._toBlockchain] = [this._toBlockchain, this._fromBlockchain];
    this.updateDropDownTokens();
    if (this.selectedToken) {
      this.changeSelectedToken(this.selectedToken);
    }
  }

  private changeSelectedToken(token: BridgeToken) {
    this.fee = undefined;
    this.selectedToken = token;
    if (!token) {
      return;
    }

    this.feeCalculationProgress = true;
    this.bridgeService.getFee(this.selectedToken.symbol, this.toBlockchain.name).subscribe(
      fee => {
        this.fee = new BigNumber(fee);
      },
      err => console.log(err),
      () => {
        this.feeCalculationProgress = false;
      }
    );
  }

  public onSelectedTokenChanges(inputToken: InputToken | null) {
    if (inputToken) {
      const bridgeToken: BridgeToken = this.tokens.find(
        token => token[this.fromBlockchain.addressName] === inputToken.address
      );
      this.changeSelectedToken(bridgeToken);
    } else {
      this.changeSelectedToken(null);
    }
  }

  public onTokensNumberChanges(tokensNumber: number | string) {
    if (tokensNumber) {
      this.fromNumber = new BigNumber(tokensNumber);
    }
  }

  public onConfirm() {
    this.buttonAnimation = true;
    this.bridgeService
      .createTrade(
        this.selectedToken,
        this.fromBlockchain.name,
        this.toBlockchain.name,
        this.fromNumber,
        this.toWalletAddress,
        () => {
          this.tradeInProgress = true;
        }
      )
      .subscribe(
        (res: string) => {
          this.tradeSuccessId = res;
        },
        err => {
          if (!(err instanceof RubicError)) {
            err = new RubicError();
          }
          let data: any = { title: 'Error', descriptionText: err.comment };
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
        }
      )
      .add(() => {
        this.tradeInProgress = false;
        this.buttonAnimation = false;
      });
  }

  @HostListener('window:resize', ['$event'])
  setBlockchainLabelName() {
    if (window.innerWidth <= this.smallMobileWidth) {
      this.Blockchains.Binance.shortLabel = this.Blockchains.Binance.name;
    } else {
      this.Blockchains.Binance.shortLabel = this.Blockchains.Binance.label;
    }
  }

  public changeWalletAddressTo(newAddress: string) {
    this.toWalletAddress = newAddress;
  }
}