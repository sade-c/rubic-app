import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CoingeckoApiService {
  private baseUrl = 'https://api.coingecko.com/api/v3/';

  constructor(private httpClient: HttpClient) {}

  public async getEtherPriceInUsd(): Promise<BigNumber> {
    const response: any = await this.httpClient
      .get(this.baseUrl + 'simple/price?ids=ethereum&vs_currencies=usd')
      .toPromise();
    return new BigNumber(response.ethereum.usd);
  }

  /* private async getTokenUsdPriceById(tokenCoingeckoId: string): Promise<BigNumber> {
    const response: any = await this.httpClient
      .get(this.baseUrl + 'simple/price?ids=ethereum&vs_currencies=usd')
      .toPromise();
    return  new BigNumber(response.ethereum.usd);
  }*/
}
