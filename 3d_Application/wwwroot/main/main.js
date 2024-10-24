﻿import * as THREE from '/lib/three/three.js';
import { OrbitControls } from '/lib/three/OrbitControls.js';
import {MODELS, SimpleModel } from './SimpleModel.js';
import { ModelsType, ModelStatus, EnumHandler } from './EnumHandler.js';
import { TransformControls } from '/lib/three/TransformControls.js';
// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

let models = []; 
// Camera setup
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Renderer setup
const renderer = new THREE.WebGLRenderer();
document.getElementById('main-view').appendChild(renderer.domElement);

// Adjust renderer size according to the div
function resizeRenderer() {
    const mainView = document.getElementById('main-view');
    renderer.setSize(mainView.clientWidth, window.innerHeight);
    camera.aspect = mainView.clientWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
resizeRenderer();
window.addEventListener('resize', resizeRenderer);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.maxPolarAngle = Math.PI / 2;
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
}
controls.autoRotate = false;

// Lights setup
const lightLeft = new THREE.DirectionalLight(0xffffff, 5);
lightLeft.position.set(10, 10, 10).normalize();
scene.add(lightLeft);
const lightRight = new THREE.DirectionalLight(0xffffff, 5);
lightRight.position.set(-10, 10, 10).normalize();
scene.add(lightRight);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add floor
const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -1, 0);
scene.add(floor);

// Add TransformControls for precise manipulation
const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.size = 0.7;
scene.add(transformControls);

transformControls.addEventListener('mouseDown', function () {
    controls.enabled = false;
    console.log(transformControls.getMode());
});

transformControls.addEventListener('mouseUp', function () {
    controls.enabled = true;
    const object = transformControls.object;
    if (object) {
        const position = object.position;
        const rotation = object.rotation;
        const scale = object.scale;

        const dataToSave = {
            id: object.uuid,
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
            scale: { x: scale.x, y: scale.y, z: scale.z }
        };

        console.log('Data to save:', dataToSave);
    }
});

//transformControls.addEventListener('objectChange', function () {

//});

// Function to fetch data from the local JSON file
async function fetchModelData() {
    try {
        const response = await fetch('main/API.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching model data:', error);
        return [];
    }
}

const modelsTypeHandler = new EnumHandler(ModelsType);
const modelStatusHandler = new EnumHandler(ModelStatus);


// Function to create models from the local JSON data
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

// Function to display the status card with a button to enable dragging
function displayStatusCard(model) {
    const statusCard = document.getElementById('status-card');
    statusCard.style.display = 'block';

    // Populate the status card with model information
    statusCard.innerHTML = `
        <button onclick="closeStatusCard()" type="button" class="btn-close" aria-label="Close"></button>
        <h3>${modelsTypeHandler.getDisplayNameByValue(model.type)} Status</h3>
        <p>Position: X=${model.position.x}, Y=${model.position.y}, Z=${model.position.z}</p>
        <p>Status: ${modelStatusHandler.getDisplayNameByValue(model.status) || 'N/A'}</p>
        <p>Description: ${model.description || 'No description available'}</p>
    `;
}

// Function to display zone buttons
function displayZoneButton(models) {
    const zoneButtonContainer = document.getElementById('mySidenav');
    zoneButtonContainer.innerHTML = '<a class="closebtn" onclick="closeNav()">&times;</a>';

    models.forEach(model => {
        if (model.type === ModelsType.CUBEZONE_MODEL.value) {
            const button = document.createElement('a');
            button.textContent = `${model.description}`;
            button.href = "javascript:void(0)";
            button.onclick = () => moveCameraToZone(model);
            zoneButtonContainer.appendChild(button);
        }
    });
}

// Function to handle mouse clicks
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
        if (parentModel) {
            transformControls.attach(parentModel.model);
            if (parentModel) {
                models.forEach(model => {
                    if (model !== parentModel) {
                        model.setOpacity(0.5);
                    }
                    else {
                        if (parentModel.type !== ModelsType.SUPPER_MODEL.value && parentModel.type !== ModelsType.CUBEZONE_MODEL.value) {
                            model.setOpacity(1);
                            moveCameraToTarget(parentModel.model);
                        }
                    }
                });
                // Display status card for the selected model
                displayStatusCard(parentModel);
            }
        }
    }
}

// Function to move camera to the selected object
function moveCameraToTarget(target) {
    const targetPosition = new THREE.Vector3();
    target.getWorldPosition(targetPosition);
    targetPosition.set(targetPosition.x + 3, targetPosition.y + 2, targetPosition.z);

    const startPosition = camera.position.clone();
    const startTime = performance.now();
    const duration = 1000;

    controls.enabled = false;

    function animateCamera(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);

        camera.position.lerpVectors(startPosition, targetPosition, t);
        camera.lookAt(targetPosition);
        camera.rotation.set(target.rotation.x, target.rotation.y, target.rotation.z * Math.PI*2);
        if (t < 1) {
            requestAnimationFrame(animateCamera);
            controls.enabled = true;
        }
    }

    requestAnimationFrame(animateCamera);
}

function moveCameraToZone(model) {
    const offset = new THREE.Vector3(
        model.scale.x,
        model.scale.y,
        model.scale.z
    );

    const targetPosition = new THREE.Vector3();
    targetPosition.set(
        model.position.x - (offset.x / 2) + 2,
        model.position.y + (offset.y / 2) - 3,
        model.position.z + (offset.z / 2) - 1
    );

    const startPosition = camera.position.clone();
    const startTime = performance.now();
    const duration = 1000;

    controls.enabled = true; // Disable OrbitControls during camera movement

    function animateCamera(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Update camera position
        camera.position.lerpVectors(startPosition, targetPosition, t);
        camera.lookAt(model.position);
        camera.rotation.set(0, Math.PI * -.20, 0);
        controls.position = new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z)
        controls.rotation = new THREE.Vector3(camera.rotation.x, camera.rotation.y, camera.rotation.z);

        if (t < 1) {
            requestAnimationFrame(animateCamera);
            controls.enabled = false;
        }
    }

    requestAnimationFrame(animateCamera);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (controls.enabled) {
        controls.position0 = camera.position;
            controls.update();
    }
    renderer.render(scene, camera);
    if (models.length != MODELS.length) {
        models = [...MODELS];
        displayZoneButton(models);
    }
}

// Fetch model data and load models
fetchModelData().then(data => {
    createModelsFromAPI(data);
});

function ActiveControleMouse(event) {
    controls.enabled = true;
}

// Event listener for mouse 
renderer.domElement.addEventListener('click', onMouseClick);
renderer.domElement.addEventListener('contextmenu', ActiveControleMouse);
renderer.domElement.addEventListener('wheel', ActiveControleMouse);

// Function to set the transform mode and handle button styles
function setTransformMode(mode, button) {
    // Set the mode of the TransformControls
    transformControls.setMode(mode);

    // Remove 'btn-primary' from all buttons and set 'btn-secondary'
    const buttons = document.querySelectorAll('#btn-group-container button');
    buttons.forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });

    // Add 'btn-primary' to the clicked button
    button.classList.remove('btn-secondary');
    button.classList.add('btn-primary');
}

// Access the buttons and assign click events
const buttons = document.querySelectorAll('#btn-group-container button');
buttons[0].addEventListener('click', () => setTransformMode('translate', buttons[0])); // First button for translate
buttons[1].addEventListener('click', () => setTransformMode('rotate', buttons[1]));    // Second button for rotate
buttons[2].addEventListener('click', () => setTransformMode('scale', buttons[2]));     // Third button for scale
setTransformMode('translate', buttons[0]);

// Call the animate function to start rendering
animate();