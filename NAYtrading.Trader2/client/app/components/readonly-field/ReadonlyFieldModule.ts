import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReadonlyFieldComponent } from './ReadonlyFieldComponent';

@NgModule({
  declarations: [ReadonlyFieldComponent],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatInputModule,
    MatIconModule
  ],
  exports: [ReadonlyFieldComponent]
})
export class ReadonlyFieldModule {}
