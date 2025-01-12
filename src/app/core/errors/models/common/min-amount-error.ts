import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { MinAmountError as SdkMinAmountError } from 'rubic-sdk';
import BigNumber from 'bignumber.js';

class MinAmountError extends RubicError<ERROR_TYPE.TEXT> {
  public readonly amount: BigNumber;

  public readonly tokenSymbol: string;

  constructor(minAmountError: SdkMinAmountError) {
    super(minAmountError.message);

    this.amount = minAmountError.minAmount;
    this.tokenSymbol = minAmountError.tokenSymbol;

    Object.setPrototypeOf(this, MinAmountError.prototype);
  }
}

export default MinAmountError;
