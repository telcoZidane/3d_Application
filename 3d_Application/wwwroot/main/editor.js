import * as THREE from '/lib/three/three.js';
import { OrbitControls } from '/lib/three/OrbitControls.js';
import '/main/tween.js';
import { MODELS, SimpleModel } from './SimpleModel.js';

// Global array for 3D assets
const Objects3D = [];


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

const ambientLight = new THREE.AmbientLight(0x404040); // soft light
scene.add(ambientLight);

// Grid helper and floor
const gridHelper = new THREE.GridHelper(1000, 100);
scene.add(gridHelper);

const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, opacity: 0.5, transparent: true });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);


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
async function fetchAssets3DData() {
    try {
        const response = await fetch('main/Assets3D_Data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching 3D assets data:', error);
        return [];
    }
}

// Process API data and create 3D objects
function createAssets3DObjectsFromAPI(models) {
    models.forEach(model => {
        displayAssets3DObjectCard(model);
    });
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
    card.innerHTML = `
        <img src="${model.img}" class="card-img-top" alt="${model.name}">
        <div class="card-body">
            <h5 class="card-text text-center">${model.name}</h5>
        </div>
    `;

    // Attach event listener to load 3D model
    card.addEventListener('click', () => spawn3DModel(model));

    // Append card to the UI
    assets3Dcart.appendChild(card);
}

// Spawn 3D model in the scene based on the ID
function spawn3DModel(item) {
    console.log(`Spawning 3D model with ID: ${item.ID}`);
    const model3d = new SimpleModel(
        item.ID,
        item.path,
        { x:0 ,y :0 ,z:0 },
        { x: 1, y: 1, z: 1 },
        1,
        0,
        item.name,
        { x: 0, y: 0, z: 0 },
        []
    );
    model3d.load(scene);
    model3d.setOpacity(1);
    Objects3D.push(model3d);
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
}

// Fetch data and initialize 3D assets
fetchAssets3DData().then(data => {
    createAssets3DObjectsFromAPI(data);
});

// Start animation
animate();
