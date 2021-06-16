import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SupportedTokensInfo } from '../../../swaps/models/SupportedTokensInfo';
import { SwapProvider } from '../../../swaps/services/swap-provider';
import { SWAP_PROVIDER_TYPE } from '../../../swaps/models/SwapProviderType';

@Injectable()
export class InstantTradesSwapProviderService extends SwapProvider {
  TYPE: SWAP_PROVIDER_TYPE.INSTANT_TRADE;

  get tokens(): Observable<SupportedTokensInfo> {
    const supportedTokensInfo = this.getSupportedTokensInfoTemplate();

    return this.tokensService.tokens.pipe(
      map(tokensList => {
        const tokens = tokensList.toArray();
        const supportedBlockchains = [
          BLOCKCHAIN_NAME.ETHEREUM,
          BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
          BLOCKCHAIN_NAME.POLYGON
        ];

        supportedBlockchains.forEach(
          blockchain =>
            (supportedTokensInfo[blockchain][blockchain] = tokens.filter(
              token => token.blockchain === blockchain
            ))
        );
        return supportedTokensInfo;
      })
    );
  }

  constructor(private tokensService: TokensService) {
    super();
  }
}
