import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerComponent } from './SpinnerComponent';

@NgModule({
  imports: [MatProgressSpinnerModule],
  declarations: [SpinnerComponent],
  exports: [SpinnerComponent]
})
export class SpinnerModule {}
