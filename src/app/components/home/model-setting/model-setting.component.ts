import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SampleModel} from "../../../model/sample-model.model";
import {UiHelperService} from "../../../core/services/ui-helper.service";
import * as THREE from 'three';

@Component({
  selector: 'app-model-setting',
  templateUrl: './model-setting.component.html',
  styleUrls: ['./model-setting.component.css']
})
export class ModelSettingComponent {

  @Output() reloadClickedEvent: EventEmitter<void> = new EventEmitter<void>();
  @Input() modelList!: Array<any>;
  @Input() modelsLoaded: boolean = false;

  selectedModel?: SampleModel;
  selectedModelHelper?: SampleModel;

  constructor(public uiHelperService: UiHelperService) {
  }

  setModelVisibility(model: SampleModel) {
    model.material.visible = model.visible;
  }

  setModelColor() {
    this.selectedModel!.material.color = new THREE.Color(this.selectedModel?.color);
  }

  setModelTransparency() {
    this.selectedModel!.material.opacity = this.selectedModel!.transparency / 100;
  }

  setSelectedModel(selectedModel: SampleModel) {
    this.selectedModel = selectedModel;
    this.updateSelectionInView();
    this.selectedModelHelper = this.selectedModel;
  }

  clearSelection() {
    if (this.selectedModel != null) {
      this.selectedModel!.selectionBox.visible = false;
      this.selectedModel = undefined;
    }
  }

  selectionChanged() {
    this.updateSelectionInView();
    this.selectedModelHelper = this.selectedModel;
  }

  updateSelectionInView() {
    if (this.selectedModelHelper != null) {
      this.selectedModelHelper.selectionBox.visible = false;
    }
    if (this.selectedModel != null) {
      this.selectedModel!.selectionBox.visible = true;
    }
  }

}
