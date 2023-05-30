import { Component } from '@angular/core';

@Component({
  selector: 'app-model-setting',
  templateUrl: './model-setting.component.html',
  styleUrls: ['./model-setting.component.css']
})
export class ModelSettingComponent {

  modelColor: string;
  modelTransparency: number;

  constructor() {
    this.modelColor = '#FFFFFF';
    this.modelTransparency = 50;
  }
}
