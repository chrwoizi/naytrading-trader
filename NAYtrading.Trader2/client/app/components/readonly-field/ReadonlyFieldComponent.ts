import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-readonly-field',
  templateUrl: './ReadonlyFieldComponent.html',
  styleUrls: ['./ReadonlyFieldComponent.scss']
})
export class ReadonlyFieldComponent implements OnInit {
  @Input() title: string;
  @Input() value: string;

  constructor() {}

  ngOnInit(): void {}
}
