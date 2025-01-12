import { NgModule } from '@angular/core';
import { TokensRateComponent } from '@features/swaps/shared/components/tokens-rate/tokens-rate.component';
import { ToAmountEstimatedComponent } from '@features/swaps/shared/components/token-amount-estimated/to-amount-estimated.component';
import { SharedModule } from '@shared/shared.module';
import { TuiHintModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TargetNetworkAddressComponent } from '@features/swaps/shared/components/target-network-address/target-network-address.component';
import { TargetNetworkAddressService } from '@features/swaps/shared/components/target-network-address/services/target-network-address.service';
import { TuiInputModule } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsWarningModalComponent } from './settings-warning-modal/settings-warning-modal.component';

@NgModule({
  declarations: [
    ToAmountEstimatedComponent,
    TokensRateComponent,
    TargetNetworkAddressComponent,
    SettingsWarningModalComponent
  ],
  exports: [
    ToAmountEstimatedComponent,
    TokensRateComponent,
    TargetNetworkAddressComponent,
    SettingsWarningModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TuiHintModule,
    InlineSVGModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule
  ],
  providers: [TargetNetworkAddressService]
})
export class SwapsSharedModule {}
