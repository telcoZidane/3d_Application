import * as THREE from '/lib/three/three.js';
import { OrbitControls } from '/lib/three/OrbitControls.js';
import '/main/tween.js';
import { MODELS, SimpleModel } from './SimpleModel.js';
import { ModelsType, ModelStatus, EnumHandler } from './EnumHandler.js';
import { DragControls } from '/lib/three/DragControls.js';

// Global array for 3D assets
const Objects3D = [];
let enabledDragModels = [];
let models=[];

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xAAAAAA);

// Camera setup
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 5, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('editor-view').appendChild(renderer.domElement);

// Adjust renderer size based on the container
function resizeRenderer() {
    const mainView = document.getElementById('editor-view');
    renderer.setSize(mainView.clientWidth, window.innerHeight);
    camera.aspect = mainView.clientWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
resizeRenderer();
window.addEventListener('resize', resizeRenderer);

// Orbit Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;

// Lights setup
const directionalLightLeft = new THREE.DirectionalLight(0xffffff, 5);
directionalLightLeft.position.set(10, 10, 10).normalize();
scene.add(directionalLightLeft);

const directionalLightRight = new THREE.DirectionalLight(0xffffff, 5);
directionalLightRight.position.set(-10, 10, 10).normalize();
scene.add(directionalLightRight);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Grid helper and floor
const gridHelper = new THREE.GridHelper(1000, 100);
scene.add(gridHelper);

const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, opacity: 0.5, transparent: true });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -1, 0);
scene.add(floor);


function createModelsFromAPI(modelData) {
    modelData.forEach(item => {
        const model = new SimpleModel(
            item.id,
            item.url,
            item.position,
            item.scale,
            item.type,
            item.status,
            item.description,
            item.rotation,
            item.components
        );
        model.load(scene);
    });
}
// Setup Drag Controls
let dragControls;
function setupDragControls() {
    dragControls = new DragControls(enabledDragModels, camera, renderer.domElement);
    dragControls.addEventListener('dragstart', function (event) {
        controls.enabled = false; // Disable orbit controls when dragging
    });

    dragControls.addEventListener('dragend', function (event) {
        controls.enabled = true; // Re-enable orbit controls after dragging
    });
}

// Function to enable dragging for a specific model
function enableDragging(model) {  // active clike for drag and drop in object selected 
    if (!enabledDragModels.includes(model.model)) {
        enabledDragModels.push(model.model); // Add the model to the list of draggable objects
        setupDragControls();
    }
   
}


function onMouseClick(event) {
    controls.enabled = true;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const target = intersects[0].object;
        const parentModel = target.userData.parentModel;
        console.log(parentModel);
        if (parentModel.type !== ModelsType.SUPPER_MODEL.value && parentModel.type !== ModelsType.CUBEZONE_MODEL.value) {
            enableDragging(parentModel);
            parentModel.setOpacity(1);
        }
        //if (parentModel) {
        //    models.forEach(model => {
        //        if (model !== parentModel) {
        //            model.setOpacity(0.5);
        //        }
        //        else {
        //            // Only move camera if the model type is not 'support'
        //            if (parentModel.type !== ModelsType.SUPPER_MODEL.value && parentModel.type !== ModelsType.CUBEZONE_MODEL.value) {
        //                model.setOpacity(1);
        //                moveCameraToTarget(parentModel.model);
        //            }
        //        }
        //    });

        //    // Display status card for the selected model
        //    displayStatusCard(parentModel);
        //}
    }
}

// UI Interaction: Axis buttons for navigation
const uiContainer = document.getElementById('ui-container');
['X', 'Y', 'Z'].forEach(axis => {
    const button = document.createElement('button');
    button.innerText = `Face ${axis}`;
    button.onclick = () => moveToFace(axis);
    uiContainer.appendChild(button);
});

// Camera transition to face specific axis
function moveToFace(axis) {
    const targetPosition = new THREE.Vector3();
    switch (axis) {
        case 'X':
            targetPosition.set(10, 2, 0);
            break;
        case 'Y':
            targetPosition.set(0, 10, 0);
            break;
        case 'Z':
            targetPosition.set(0, 2, 10);
            break;
        default:
            console.warn('Invalid axis:', axis);
            return;
    }

    // Smooth camera transition using TWEEN.js
    new TWEEN.Tween(camera.position)
        .to(targetPosition, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.lookAt(0, 0, 0);
        })
        .start();
}

// Fetch 3D assets data from JSON file
async function fetchAssets3DData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching 3D assets data:', error);
        return [];
    }
}
const modelsTypeHandler = new EnumHandler(ModelsType);
// Process API data and create 3D objects
function createAssets3DObjectsFromAPI(models) {
    models.forEach(model => {
        displayAssets3DObjectCard(model);
    });
}
function convertJsonToJsTreeData(jsonData) {
    const treeData = jsonData.map(model => {
        return {
            text: model.description || "Model",
            id: model.id,
            state: {
                opened: true
            },
            children: model.components.map(component => {
                return {
                    text: component.description || "Component", 
                    id: "Id_Obj_3d_"+component.id,
                    type: (component.type == 1) ? "default" :"component"
                };
            })
        };
    });
    return treeData;
}


// Display 3D asset cards in the UI
function displayAssets3DObjectCard(model) {
    const assets3Dcart = document.getElementById('canva_Assets_3D_objects');

    if (!assets3Dcart) {
        console.error('Assets3Dcart element not found!');
        return;
    }

    // Create card for 3D asset
    const card = document.createElement('div');
    card.id = `id_${model.ID}`;
    card.className = 'card mt-3';
    // Use proper string concatenation for the image URL
    let urlcart = `https://localhost:7161/objImgcapture/IMG_OBJ_${model.ID}.png`;

    card.innerHTML = `
        <img src="${urlcart}" class="card-img-top" alt="${model.name}">
        <div class="card-body">
            <h5 class="card-text ">${model.name}</h5>
            <button id="btn_${model.ID}" class="btn btn-primary">Utiliser</button>
        </div>
    `;

    // Append card to the UI
    assets3Dcart.appendChild(card);
    // Attach event listener to load 3D model
    const btn_card = document.getElementById(`btn_${model.ID}`);
    btn_card.addEventListener('click', () => spawn3DModel(model));
}

// Spawn 3D model in the scene based on the ID
function spawn3DModel(item) {
    console.log(`Spawning 3D model with ID: ${item.ID}`);
    const model3d = new SimpleModel(
        item.ID,
        item.path,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1 },
        1,
        0,
        item.name,
        { x: 0, y: 0, z: 0 },
        []
    );
    model3d.load(scene);
    Objects3D.push(model3d);
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
    //console.log(Objects3D);
    if (MODELS.length > models) {
        models = [...MODELS];
    }
}

// Fetch data, initialize 3D assets, and load/capture images
fetchAssets3DData('main/Assets3D_Data.json').then(data => {
    createAssets3DObjectsFromAPI(data);
});

// menu bar
var assetPath = '../../../app-assets/';
if ($('body').attr('data-framework') === 'laravel') {
    assetPath = $('body').attr('data-asset-path');
}
fetchAssets3DData('main/models.json')
    .then(data => {
      
        const jsTreeData = convertJsonToJsTreeData(data);

       $('#jstree-drag-drop').jstree({
           core: {
               check_callback: true,
                data: jsTreeData
            },
           plugins: ['types', 'dnd'],
            types: {
                default: {
                    icon: 'fas fa-cubes'
                },
                component: {
                    icon: 'fas fa-cube text-primary'
                }
            }
       });
        createModelsFromAPI(data);
    })
    .catch(error => console.error('Error loading JSON file:', error));
// events mouse click
renderer.domElement.addEventListener('click', onMouseClick);
// Start animation
animate();
