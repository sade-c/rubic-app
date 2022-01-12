import InstantTrade from '@features/instant-trade/models/instant-trade';
import BigNumber from 'bignumber.js';

export interface UniV3AlgebraRoute {
  /**
   * Resulting value in Wei.
   */
  outputAbsoluteAmount: BigNumber;
}

export interface UniV3AlgebraInstantTrade extends InstantTrade {
  /**
   * Route info, containing path and output amount.
   */
  route: UniV3AlgebraRoute;
}