import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {UiHelperService} from "../../core/services/ui-helper.service";
import {PerspectiveCamera, Raycaster, Vector2, Vector3} from "three";
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {ModelService} from "../../core/services/model.service";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {SampleModel} from "../../model/sample-model.model";
import {ModelSettingComponent} from "./model-setting/model-setting.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  settingSidebarVisible: boolean;

  @ViewChild('canvas') private canvasRef!: ElementRef;
  @ViewChild('modelSettingComponent') private modelSettingComponent?: ModelSettingComponent;

  private camera!: PerspectiveCamera;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;

  raycaster!: Raycaster;
  clickMouse!: Vector2;
  moveMouse!: Vector2;

  cameraDistance!: number;
  fieldOfView!: number;
  nearClippingPlane!: number;
  farClippingPlane!: number;

  public size!: number;

  public sampleModels!: SampleModel[];

  protected readonly CameraView = CameraView;

  constructor(public uiHelperService: UiHelperService, private modelService: ModelService, private changeDetector : ChangeDetectorRef) {
    this.settingSidebarVisible = false;
    this.setupDefaultValues();
  }

  ngAfterViewInit() {
    this.setupRenderer();
    this.createScene();
    this.setupCamera();
    this.setupLights();
    this.setGridHelper();
    this.prepareMouseEvents();

    this.loadSampleModels();

    this.startRenderingLoop();
    this.changeDetector.detectChanges();
  }

  setupDefaultValues() {
    THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
    THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;
    THREE.Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;

    this.cameraDistance = 20;
    this.fieldOfView = 20;
    this.nearClippingPlane = 1;
    this.farClippingPlane = 1000;

    this.sampleModels = [];
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x555555);
  }

  setupCamera() {
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(this.fieldOfView, aspectRatio, this.nearClippingPlane, this.farClippingPlane);

    this.setCameraView(CameraView.DEFAULT);

    let controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
  }

  setupLights() {
    let light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(400, 100, 100)
    light.intensity = 0.3;
    light.castShadow = true;
    this.scene.add(light);

    let light2 = new THREE.DirectionalLight(0xFFFFFF);
    light2.position.set(100, 400, 400)
    light2.intensity = 2;
    light2.castShadow = true;
    this.scene.add(light2);

    let light3 = new THREE.DirectionalLight(0xFFFFFF);
    light3.position.set(-400, -200, 100)
    light3.intensity = 0.5;
    light3.castShadow = true;
    this.scene.add(light3);
  }

  setGridHelper() {
    const size = 10;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.rotation.x = THREE.MathUtils.degToRad(90);
    gridHelper.rotation.y = THREE.MathUtils.degToRad(90);
    this.scene.add(gridHelper);
  }

  prepareMouseEvents() {
    this.raycaster = new THREE.Raycaster();
    this.clickMouse = new THREE.Vector2();
    this.moveMouse = new THREE.Vector2();
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

  loadSampleModels() {
    for (let sampleObject of this.sampleModels) {
      this.scene.remove(sampleObject.gltf.scene);
    }

    this.sampleModels = [];
    let index = 0;

    let loader = new GLTFLoader();
    this.modelService.getSampleModels().subscribe((sampleModels: any) => {
      for (let model of sampleModels) {
        loader.load(model.url, (gltfModel) => {
          gltfModel.scene.rotation.x = THREE.MathUtils.degToRad(90);
          let boundingBox = new THREE.Box3().setFromObject(gltfModel.scene)

          let xSize = boundingBox.max.x - boundingBox.min.x
          let ySize = boundingBox.max.y - boundingBox.min.y
          let zSize = boundingBox.max.z - boundingBox.min.z

          let maxSize = Math.max(xSize, ySize, zSize);

          let randomMaxSize = 2 + Math.random() * 2;

          gltfModel.scene.scale.multiplyScalar(randomMaxSize / maxSize);

          let positionRight = false;
          while (!positionRight) {
            gltfModel.scene.position.x = this.generateRandomInteger(-5, 3);
            gltfModel.scene.position.y = this.generateRandomInteger(-5, 3);
            gltfModel.scene.position.z = 0;

            let foundIntersection = false;
            for (let checkModel of this.sampleModels) {
              let boundingBox = new THREE.Box3().setFromObject(checkModel.gltf.scene);
              if (boundingBox.intersectsBox(new THREE.Box3().setFromObject(gltfModel.scene))) {
                foundIntersection = true;
              }
            }
            positionRight = !foundIntersection;
          }

          let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

          let standardMaterial = new THREE.MeshStandardMaterial({color: randomColor, transparent: true});

          gltfModel.scene.traverse((child) => {
            for (let childModel of child.children) {
              if (childModel instanceof THREE.Mesh) {
                childModel.material = standardMaterial;
              }
            }
          });

          this.scene.add(gltfModel.scene);

          this.sampleModels.push(new SampleModel(index, model.name, true, gltfModel, 100, randomColor, standardMaterial));
          index++;
        });
      }
    });
  }

  generateRandomInteger(min: number, max: number) {
    return Math.floor(min + Math.random() * (max - min + 1))
  }

  setCameraView(position: CameraView) {
    switch (position) {
      case CameraView.DEFAULT:
        this.camera.position.z = this.cameraDistance;
        this.camera.position.x = 0 - this.cameraDistance;
        this.camera.position.y = 0 - this.cameraDistance;
        break;
      case CameraView.LEFT:
        this.camera.position.z = 0;
        this.camera.position.x = 0 - this.cameraDistance * 2;
        this.camera.position.y = 0;
        break;
      case CameraView.RIGHT:
        this.camera.position.z = 0;
        this.camera.position.x = this.cameraDistance * 2;
        this.camera.position.y = 0;
        break;
      case CameraView.FRONT:
        this.camera.position.z = 0;
        this.camera.position.x = 0;
        this.camera.position.y = 0 - this.cameraDistance * 2;
        break;
      case CameraView.TOP:
        this.camera.position.z = this.cameraDistance * 2;
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        break;
    }
    this.camera.lookAt(new Vector3(0, 0, 0));
  }

  canvasClicked(event: any) {
    this.clickMouse.x = (event.offsetX / this.canvas.width) * 2 - 1;
    this.clickMouse.y = -(event.offsetY / this.canvas.height) * 2 + 1;

    this.raycaster.setFromCamera(this.clickMouse, this.camera);

    for (let model of this.sampleModels) {
      let clickedModels = this.raycaster.intersectObjects(model.gltf.scene.children).filter((object) => !(object.object instanceof THREE.GridHelper));
      if (clickedModels.length > 0) {
        this.modelSettingComponent?.setSelectedModel(model);
      }
    }

  }

}

enum CameraView {
  DEFAULT,
  FRONT,
  TOP,
  LEFT,
  RIGHT
}
