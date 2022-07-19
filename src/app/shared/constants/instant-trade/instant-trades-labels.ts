import { TRADE_TYPE, TradeType } from 'rubic-sdk';

export const instantTradesLabels: Record<TradeType, string> = {
  [TRADE_TYPE.ONE_INCH]: '1inch',
  [TRADE_TYPE.UNISWAP_V2]: 'Uniswap V2',
  [TRADE_TYPE.UNI_SWAP_V3]: 'Uniswap V3',
  [TRADE_TYPE.PANCAKE_SWAP]: 'Pancakeswap',
  [TRADE_TYPE.QUICK_SWAP]: 'Quickswap',
  [TRADE_TYPE.ZRX]: '0x',
  [TRADE_TYPE.PANGOLIN]: 'Pangolin',
  [TRADE_TYPE.JOE]: 'Joe',
  [TRADE_TYPE.SOLAR_BEAM]: 'Solarbeam',
  [TRADE_TYPE.SPOOKY_SWAP]: 'Spookyswap',
  [TRADE_TYPE.SPIRIT_SWAP]: 'Spiritswap',
  [TRADE_TYPE.WRAPPED]: 'Wrapped',
  [TRADE_TYPE.RAYDIUM]: 'Raydium',
  [TRADE_TYPE.ALGEBRA]: 'Algebra',
  [TRADE_TYPE.VIPER_SWAP]: 'Viperswap',
  [TRADE_TYPE.TRISOLARIS]: 'Trisolaris',
  [TRADE_TYPE.WANNA_SWAP]: 'Wannaswap',
  [TRADE_TYPE.REF_FINANCE]: 'Ref finance',
  [TRADE_TYPE.ZAPPY]: 'Zappy',
  [TRADE_TYPE.SUSHI_SWAP]: 'Sushiswap',
  [TRADE_TYPE.PARA_SWAP]: 'Paraswap',
  [TRADE_TYPE.OPEN_OCEAN]: 'OpenOcean',
  [TRADE_TYPE.DODO]: 'Dodo',
  [TRADE_TYPE.HONEY_SWAP]: 'Honeyswap',
  [TRADE_TYPE.STELLA_SWAP]: 'Stellaswap',
  [TRADE_TYPE.BEAM_SWAP]: 'Beamswap',
  [TRADE_TYPE.UBE_SWAP]: 'Ubeswap',
  [TRADE_TYPE.J_SWAP]: 'Jswap'
};
