import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class NoDataMyTradesError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.noMetamaskAccess');
    Object.setPrototypeOf(this, NoDataMyTradesError.prototype);
  }
}
