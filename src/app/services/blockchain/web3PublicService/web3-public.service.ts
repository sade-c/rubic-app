import { Injectable } from '@angular/core';
import ConnectionLink from '../types/ConnectionLink';
import { BLOCKCHAIN_NAME } from '../types/Blockchain';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { ERC20_TOKEN_ABI } from '../../web3LEGACY/web3.constants';
import { Web3Public } from './Web3Public';
import { PublicProviderService } from '../publicProvider/public-provider.service';

@Injectable({
  providedIn: 'root'
})
export class Web3PublicService {
  private readonly connectionLinks: ConnectionLink[];
  constructor(publicProvider: PublicProviderService) {
    this.connectionLinks = publicProvider.connectionLinks;
    const web3Connections = this.connectionLinks.map(connection => ({
      [connection.blockchainName as BLOCKCHAIN_NAME]: new Web3Public(new Web3(connection.rpcLink))
    }));
    Object.assign(this, web3Connections);
  }
}
