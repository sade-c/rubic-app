import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { map, startWith } from 'rxjs/operators';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';

@Component({
  selector: 'app-to-amount-estimated',
  templateUrl: './to-amount-estimated.component.html',
  styleUrls: ['./to-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToAmountEstimatedComponent {
  @Input() errorText = '';

  public readonly formData$ = this.swapFormService.inputValueChanges.pipe(
    startWith(this.swapFormService.inputValue)
  );

  public readonly isFormFilled$ = this.swapFormService.isFilled$;

  public readonly toAmount$ = this.swapFormService.outputValueChanges.pipe(
    map(form => (form.toAmount?.isFinite() ? BigNumber.max(0, form.toAmount) : null))
  );

  constructor(private readonly swapFormService: SwapFormService) {}
}
