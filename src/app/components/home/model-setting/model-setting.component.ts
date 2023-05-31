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
  @Input() scene?: THREE.Scene;

  selectedModel?: SampleModel;

  selectionBox: any;

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
    this.showSelectionBoundingBox();
  }

  clearSelection() {
    if (typeof this.selectionBox !== 'undefined') {
      this.scene!.remove(this.selectionBox);
    }
    this.selectedModel = undefined;
  }

  showSelectionBoundingBox() {
    if (typeof this.selectionBox !== 'undefined') {
      this.scene!.remove(this.selectionBox);
    }
    let box = new THREE.BoxHelper( this.selectedModel?.gltf.scene, 0xffff00 );
    this.selectionBox = box;
    this.scene!.add(box);
  }

}
