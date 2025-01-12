import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwapsFormComponent } from '@features/swaps/features/swaps-form/swaps-form.component';

const routes: Routes = [{ path: '', component: SwapsFormComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwapsRoutingModule {}
