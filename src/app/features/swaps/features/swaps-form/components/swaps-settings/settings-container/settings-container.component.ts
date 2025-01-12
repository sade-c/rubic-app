import { ChangeDetectionStrategy, Component, Injector, OnInit, Type } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { SettingsItComponent } from '@features/swaps/features/swaps-form/components/swaps-settings/settings-it/settings-it.component';
import { SettingsCcrComponent } from '@features/swaps/features/swaps-form/components/swaps-settings/settings-ccr/settings-ccr.component';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';

@Component({
  selector: 'app-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  public settingsComponent: PolymorpheusComponent<
    SettingsItComponent | SettingsCcrComponent,
    Injector
  >;

  public open: boolean;

  private prevMode: SWAP_PROVIDER_TYPE;

  constructor(
    private readonly swapService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {
    this.open = false;
  }

  ngOnInit(): void {
    this.settingsComponent = this.getSettingsComponent();
    this.swapFormService.commonTrade.valueChanges.subscribe(() => {
      if (this.prevMode !== this.swapService.swapMode) {
        this.settingsComponent = this.getSettingsComponent();
      }
      this.prevMode = this.swapService.swapMode;
    });
  }

  public getSettingsComponent(): PolymorpheusComponent<
    SettingsItComponent | SettingsCcrComponent,
    Injector
  > {
    let component;
    switch (this.swapService.swapMode) {
      case SWAP_PROVIDER_TYPE.INSTANT_TRADE:
        component = SettingsItComponent;
        break;
      default:
        component = SettingsCcrComponent;
    }
    return new PolymorpheusComponent(component as Type<SettingsItComponent | SettingsCcrComponent>);
  }
}
