import {BoxHelper, Group, MeshStandardMaterial} from "three";

export class SampleModel {

  index: number;
  name: string;
  visible: boolean;
  gltf: any;
  transparency: number;
  color: string;
  material: MeshStandardMaterial;
  group: Group;
  selectionBox: BoxHelper;

  constructor(
    index: number,
    name: string,
    visible: boolean,
    gltf: any,
    transparency: number,
    color: string,
    material: MeshStandardMaterial,
    group: Group,
    selectionBox: BoxHelper
  ) {
    this.index = index;
    this.name = name;
    this.visible = visible;
    this.gltf = gltf;
    this.transparency = transparency;
    this.color = color;
    this.material = material;
    this.group = group;
    this.selectionBox = selectionBox;
  }
}
