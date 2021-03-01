interface IBridgeToken {
  name: string;
  symbol: string;
  bcSymbol: string;
  ethSymbol: string;
  bscSymbol: string;
  icon: string;
  minAmount: number;
  maxAmount: number;
  promotion: boolean;
  enabled: boolean;
  bscContractAddress: string;
  bscContractDecimal: number;
  ethContractAddress: string;
  ethContractDecimal: string;
}

interface ITableTransaction {
  fromNetwork: string;
  toNetwork: string;
  actualFromAmount: number;
  actualToAmount: number;
  ethSymbol: string;
  bscSymbol: string;
  updateTime: string;
  status: string;
  transaction_id: string;
  walletFromAddress: string;
  walletToAddress: string;
  walletDepositAddress: string;
  code: number;
  image_link: string;
}

interface IBlockchain {
  name: BridgeNetwork;
  shortLabel: string; // for mobiles
  label: string;
  img: string;
  baseUrl: string;
  addressBaseUrl: string;
  scanner: {
    label: string;
    baseUrl: string;
  };
  symbolName: string;
  decimalsName: string;
  addressName: string;
}

interface IBlockchains {
  [blockchain: string]: IBlockchain;
}

enum BridgeNetwork {
  ETHEREUM = 'ETH',
  BINANCE_SMART_CHAIN = 'BSC',
  ETHEREUM_TESTNET = 'KVN'
}

export { BridgeNetwork, IBridgeToken, ITableTransaction, IBlockchain, IBlockchains };