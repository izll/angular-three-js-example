import {MeshStandardMaterial} from "three";

export class SampleModel {

  index: number;
  name: string;
  visible: boolean;
  gltf: any;
  transparency: number;
  color: string;
  material: MeshStandardMaterial;

  constructor(index: number, name: string, visible: boolean, gltf: any, transparency: number, color: string, material: MeshStandardMaterial) {
    this.index = index;
    this.name = name;
    this.visible = visible;
    this.gltf = gltf;
    this.transparency = transparency;
    this.color = color;
    this.material = material;
  }
}
