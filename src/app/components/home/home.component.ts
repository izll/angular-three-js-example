import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {UiHelperService} from "../../core/services/ui-helper.service";
import {
  Box3, BoxGeometry,
  BoxHelper,
  CameraHelper, Color, DirectionalLight,
  DirectionalLightHelper, GridHelper, Group, MathUtils,
  Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer
} from "three";
import {ModelService} from "../../core/services/model.service";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {SampleModel} from "../../model/sample-model.model";
import {ModelSettingComponent} from "./model-setting/model-setting.component";
import {DragControls} from "three/examples/jsm/controls/DragControls";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  settingSidebarVisible: boolean;

  @ViewChild('canvas') private canvasRef!: ElementRef;
  @ViewChild('canvasContainer') private canvasContainer!: ElementRef;
  @ViewChild('modelSettingComponent') private modelSettingComponent?: ModelSettingComponent;

  public camera!: PerspectiveCamera;
  private orbitControls!: OrbitControls;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  public renderer!: WebGLRenderer;
  public scene!: Scene;

  raycaster!: Raycaster;
  clickMouse!: Vector2;
  moveMouse!: Vector2;
  dragControls?: DragControls;

  cameraDistance!: number;
  fieldOfView!: number;
  nearClippingPlane!: number;
  farClippingPlane!: number;

  public size!: number;

  public sampleModels!: SampleModel[];
  public sceneHelpers!: Mesh[];
  public sampleModelsLoaded = false;

  protected readonly CameraView = CameraView;

  firstLoad!: boolean;

  constructor(
    public uiHelperService: UiHelperService,
    private modelService: ModelService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.settingSidebarVisible = false;
    this.setupDefaultValues();
  }

  ngAfterViewInit() {
    this.setupRenderer();
    this.createScene();
    this.setupCamera();
    this.setupOrbitControls();
    this.setupLights();
    this.setGridHelper();
    this.prepareMouseEvents();

    this.loadSampleModels();

    this.startRenderingLoop();
    this.changeDetector.detectChanges();
  }

  setupDefaultValues() {
    // Set coordinate system to left-handed
    Object3D.DEFAULT_UP.set(0, 0, 1);
    Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;
    Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;

    // Set camera settings
    this.cameraDistance = 20;
    this.fieldOfView = 20;
    this.nearClippingPlane = 1;
    this.farClippingPlane = 1000;

    this.sampleModels = [];
    this.sceneHelpers = [];
    this.firstLoad = true;
  }

  setupRenderer() {
    let clientWidth = this.canvasContainer.nativeElement.clientWidth;
    let clientHeight = this.canvasContainer.nativeElement.clientHeight;
    this.renderer = new WebGLRenderer({canvas: this.canvas});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(clientWidth, clientHeight);
  }

  createScene() {
    this.scene = new Scene();
    this.scene.background = new Color(0x555555);
  }

  setupCamera() {
    let aspectRatio = this.getAspectRatio();
    this.camera = new PerspectiveCamera(this.fieldOfView, aspectRatio, this.nearClippingPlane, this.farClippingPlane);
    this.setCameraView(CameraView.DEFAULT, false);
  }

  setupOrbitControls() {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableZoom = true;
    this.orbitControls.enablePan = true;
    this.orbitControls.enableRotate = true;
    this.orbitControls.enableDamping = true;
    this.orbitControls.addEventListener('start', () => {
      this.dragControls!.deactivate();
    });
    this.orbitControls.addEventListener('end', () => {
      this.dragControls!.activate();
    });
  }

  setupLights() {
    let light = new DirectionalLight(0xFFFFFF);
    light.position.set(40, 10, 10);
    light.intensity = 0.3;
    light.castShadow = true;

    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 100;

    this.scene.add(light);

    let light2 = new DirectionalLight(0xFFFFFF);
    light2.position.set(10, 40, 40);
    light2.intensity = 2;
    light2.castShadow = true;

    light2.shadow.mapSize.width = 512;
    light2.shadow.mapSize.height = 512;
    light2.shadow.camera.near = 0.5;
    light2.shadow.camera.far = 100;

    this.scene.add(light2);


    let light3 = new DirectionalLight(0xFFFFFF);
    light3.position.set(-40, -20, 10);
    light3.intensity = 0.5;
    light3.castShadow = true;

    light3.shadow.mapSize.width = 512;
    light3.shadow.mapSize.height = 512;
    light3.shadow.camera.near = 0.5;
    light3.shadow.camera.far = 100;

    this.scene.add(light3);
  }

  setGridHelper() {
    const size = 10;
    const divisions = 10;

    const gridHelper = new GridHelper(size, divisions);
    gridHelper.rotation.x = MathUtils.degToRad(90);
    gridHelper.rotation.y = MathUtils.degToRad(90);
    this.scene.add(gridHelper);
  }

  prepareMouseEvents() {
    this.raycaster = new Raycaster();
    this.clickMouse = new Vector2();
    this.moveMouse = new Vector2();
  }

  getAspectRatio(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  loadSampleModels() {
    this.sampleModelsLoaded = false;

    for (let sampleObject of this.sampleModels) {
      this.scene.remove(sampleObject.gltf.scene);
    }

    for (let sceneHelper of this.sceneHelpers) {
      this.scene.remove(sceneHelper);
    }
    this.sceneHelpers.splice(0);

    if (typeof this.dragControls != 'undefined') {
      for (let model of this.dragControls.getObjects()) {
        this.scene.remove(model);
      }
      this.dragControls.getObjects().splice(0);
    }

    this.sampleModels = [];

    let loader = new GLTFLoader();
    this.modelService.getSampleModels().subscribe((sampleModels: any) => {
      let index = 0;
      let dragModels: any[] = [];
      let gltfModelsReferenceHelper: any = {};

      // Load models with Promise.all to wait for all of them to be loaded
      let promises = [];
      for (let model of sampleModels) {
        promises.push(this.loadSampleModel(loader, model, gltfModelsReferenceHelper, index, dragModels));
        index++;
      }

      Promise.all(promises).then(() => {
        // Add drag controls
        this.dragControls = new DragControls(dragModels, this.camera, this.renderer.domElement)
        this.dragControls.addEventListener('hoveron', () => {
          this.orbitControls.enabled = false;
        });
        this.dragControls.addEventListener('hoveroff', () => {
          this.orbitControls.enabled = true;
        });
        this.dragControls.addEventListener('drag', (event) => {
          let reference = gltfModelsReferenceHelper[event['object'].name];
          let sampleModel = (<SampleModel>reference.model);
          sampleModel.gltf.scene.position.x = event['object'].position.x + reference['xDifference'];
          sampleModel.gltf.scene.position.y = event['object'].position.y + reference['yDifference'];
          sampleModel.gltf.scene.position.z = event['object'].position.z + reference['zDifference'];
          sampleModel.selectionBox.update();
        });
        this.dragControls.addEventListener('dragstart', (event) => {
          let sampleModel = (<SampleModel>gltfModelsReferenceHelper[event['object'].name].model);
          if (!sampleModel.selectionBox.visible) {
            this.modelSettingComponent!.setSelectedModel(sampleModel);
          }
          this.orbitControls.enabled = false;
        });
        this.dragControls.addEventListener('dragend', () => {
          this.orbitControls.enabled = true;
        });

        this.sampleModelsLoaded = true;
        if (this.firstLoad) {
          this.setCameraView(CameraView.DEFAULT, true);
        }
      });
    });
  }

  // Load sample model with promise
  loadSampleModel(loader: GLTFLoader, model: any, gltfModelsReferenceHelper: any, index: number, dragModels: any[]) {
    return new Promise<void>((resolve, reject) => {
      loader.load(model.url, (gltfModel) => {
        // Set model rotation and name
        gltfModel.scene.rotation.x = MathUtils.degToRad(90);

        // Randomize loaded model position and scale to nearly same size
        let boundingBox = new Box3().setFromObject(gltfModel.scene);

        let xSize = boundingBox.max.x - boundingBox.min.x
        let ySize = boundingBox.max.y - boundingBox.min.y
        let zSize = boundingBox.max.z - boundingBox.min.z

        let maxSize = Math.max(xSize, ySize, zSize);

        let randomMaxSize = 2 + Math.random() * 2;

        let gltfModelScale = randomMaxSize / maxSize;
        gltfModel.scene.scale.multiplyScalar(gltfModelScale);

        let positionRight = false;
        while (!positionRight) {
          gltfModel.scene.position.x = this.generateRandomInteger(-5, 3);
          gltfModel.scene.position.y = this.generateRandomInteger(-5, 3);
          gltfModel.scene.position.z = 0;

          let foundIntersection = false;
          for (let checkModel of this.sampleModels) {
            let boundingBox = new Box3().setFromObject(checkModel.gltf.scene);
            if (boundingBox.intersectsBox(new Box3().setFromObject(gltfModel.scene))) {
              foundIntersection = true;
            }
          }
          positionRight = !foundIntersection;
        }

        // Randomize material and set shadow
        let randomColor = '#' + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, '0');
        let standardMaterial = new MeshStandardMaterial({color: randomColor, transparent: true});

        let childGroup: Group;

        gltfModel.scene.traverse((childObject) => {
          if (childObject instanceof Group) {
            childGroup = childObject;
          }
          if (childObject instanceof Mesh) {
            childObject.material = standardMaterial;
            childObject.castShadow = true;
            childObject.frustumCulled = false;
            childObject.geometry.computeVertexNormals();
            childObject.receiveShadow = true;
          }
        });

        gltfModel.scene.updateMatrix();

        // Add selection box
        let selectionBox = new BoxHelper(gltfModel.scene, 0xffff00);
        selectionBox.visible = false;
        this.scene.add(selectionBox);

        // Set model dragging with invisible box geometry
        let gltfModelBoundingBox = new Box3().setFromObject(gltfModel.scene);
        let gltfModelBoundingBoxSize = gltfModelBoundingBox.getSize(new Vector3());
        let gltfModelBoundingBoxCenter = gltfModelBoundingBox.getCenter(new Vector3());

        let modelDragBox = new Mesh(
          new BoxGeometry(gltfModelBoundingBoxSize.x, gltfModelBoundingBoxSize.y, gltfModelBoundingBoxSize.z),
          new MeshBasicMaterial({transparent: true, opacity: 0})
        )

        modelDragBox.visible = false;
        modelDragBox.position.x = gltfModelBoundingBoxCenter.x;
        modelDragBox.position.y = gltfModelBoundingBoxCenter.y;
        modelDragBox.position.z = gltfModelBoundingBoxCenter.z;

        modelDragBox.name = "modelDragBox_" + index;
        dragModels.push(modelDragBox);

        this.scene.add(modelDragBox);
        this.sceneHelpers.push(modelDragBox);

        this.scene.add(gltfModel.scene);

        let sampleModel = new SampleModel(index, model.name, true, gltfModel, 100, randomColor, standardMaterial, childGroup!, selectionBox);
        this.sampleModels.push(sampleModel);

        gltfModelsReferenceHelper[modelDragBox.name] = {
          model: sampleModel,
          xDifference: (gltfModel.scene.position.x - gltfModelBoundingBoxCenter.x),
          yDifference: (gltfModel.scene.position.y - gltfModelBoundingBoxCenter.y),
          zDifference: (gltfModel.scene.position.z - gltfModelBoundingBoxCenter.z)
        };

        index++;
        resolve();
      }, () => {
      }, () => {
        reject();
      });
    });
  }

  generateRandomInteger(min: number, max: number) {
    return Math.floor(min + Math.random() * (max - min + 1))
  }

  setCameraView(position: CameraView, optimizeCameraDistance: boolean) {
    if (optimizeCameraDistance) {
      if (this.uiHelperService.mobileView) {
        this.cameraDistance = 15 * (3 - this.getAspectRatio());
      } else {
        this.cameraDistance = 12 * (3 - this.getAspectRatio());
      }
    }
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
      let clickedModels = this.raycaster.intersectObjects(model.gltf.scene.children).filter((object) => !(object.object instanceof GridHelper));
      if (clickedModels.length > 0) {
        this.modelSettingComponent?.setSelectedModel(model);
      }
    }
  }

  addLightHelper(light: DirectionalLight) {
    let lightHelper = new DirectionalLightHelper(light, 1);
    this.scene.add(lightHelper);
    let helper = new CameraHelper(light.shadow.camera)
    this.scene.add(helper)
  }

  startRenderingLoop() {
    let component: any = this;
    (function render() {
      requestAnimationFrame(render);
      component.renderer.render(component.scene, component.camera);
    }());
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.canvas.style.display = 'none';
    let newWidth = this.canvasContainer.nativeElement.clientWidth;
    let newHeight = this.canvasContainer.nativeElement.clientHeight;

    setTimeout(() => {
      this.canvas.style.display = 'block';
      this.renderer.setSize(newWidth, newHeight);
      this.camera.aspect = this.getAspectRatio();
      this.camera.updateProjectionMatrix();
    });
  }

}

enum CameraView {
  DEFAULT,
  FRONT,
  TOP,
  LEFT,
  RIGHT
}
