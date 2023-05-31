import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {UiHelperService} from "../../core/services/ui-helper.service";
import {PerspectiveCamera, Vector3} from "three";
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  settingSidebarVisible: boolean;

  @ViewChild('canvas') private canvasRef!: ElementRef;

  private camera!: PerspectiveCamera;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  cameraZ!: number;
  fieldOfView!: number;
  nearClippingPlane!: number;
  farClippingPlane!: number;

  public size!: number;

  private cube!: THREE.Mesh;

  constructor(public uiHelperService: UiHelperService) {
    this.settingSidebarVisible = false;
    this.setupDefaultValues();
  }

  ngAfterViewInit() {
    this.setupRenderer();
    this.createScene();
    this.setupCamera();
    this.setGridHelper();
    this.startRenderingLoop();
  }

  setupDefaultValues() {
    THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
    THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;
    THREE.Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;

    this.cameraZ = 20;
    this.fieldOfView = 20;
    this.nearClippingPlane = 1;
    this.farClippingPlane = 1000;
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x555555);
    this.scene.add(this.cube);
  }

  setupCamera() {
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(this.fieldOfView, aspectRatio, this.nearClippingPlane, this.farClippingPlane);

    this.camera.up.set(0, 0, 1);

    this.camera.position.z = this.cameraZ;
    this.camera.position.x = 0 - this.cameraZ;
    this.camera.position.y = 0 - this.cameraZ;
    this.camera.lookAt(new Vector3(0, 0, 0));

    let controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
  }

  setGridHelper() {
    const size = 10;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.rotation.x = THREE.MathUtils.degToRad(90);
    gridHelper.rotation.y = THREE.MathUtils.degToRad(90);
    this.scene.add(gridHelper);
  }

  getAspectRatio(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  startRenderingLoop() {
    let component: any = this;
    (function render() {
      requestAnimationFrame(render);
      component.renderer.render(component.scene, component.camera);
    }());
  }

}
