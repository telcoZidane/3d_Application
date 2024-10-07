//import * as THREE from '/lib/three/three.js';
//import { OrbitControls } from '/lib/three/OrbitControls.js';
//import { GLTFLoader } from '/lib/three/GLTFLoader.js';
//import { FBXLoader } from '/lib/three/FBXLoader.js';
//import { DragControls } from '/lib/three/DragControls.js';
//import { ViewHelper } from '/path/to/ViewHelper.js'; // Adjust the path as necessary

//// Scene setup
//const scene = new THREE.Scene();
//scene.background = new THREE.Color(0xAAAAAA);

//// Camera setup
//const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
//camera.position.set(10, 10, 10);
//camera.lookAt(new THREE.Vector3(0, 0, 0));

//// Renderer setup
//const renderer = new THREE.WebGLRenderer();
//document.getElementById('editor-view').appendChild(renderer.domElement);

//// Adjust renderer size according to the div
//function resizeRenderer() {
//    const mainView = document.getElementById('editor-view');
//    renderer.setSize(mainView.clientWidth, window.innerHeight);
//    camera.aspect = mainView.clientWidth / window.innerHeight;
//    camera.updateProjectionMatrix();
//}
//resizeRenderer(); // Initial resize
//window.addEventListener('resize', resizeRenderer); // Adjust on window resize

//// Controls setup
//const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;
//controls.enableZoom = true;
//controls.mouseButtons = {
//    LEFT: THREE.MOUSE.ROTATE,
//    MIDDLE: THREE.MOUSE.DOLLY,
//    RIGHT: THREE.MOUSE.PAN
//}
//controls.autoRotate = false;

//// Lights setup
//const lightLeft = new THREE.DirectionalLight(0xffffff, 5);
//lightLeft.position.set(10, 10, 10).normalize();
//scene.add(lightLeft);

//const lightRight = new THREE.DirectionalLight(0xffffff, 5);
//lightRight.position.set(-10, 10, 10).normalize();
//scene.add(lightRight);

//const ambientLight = new THREE.AmbientLight(0x404040);
//scene.add(ambientLight);

//// Floor with grid
//const gridHelper = new THREE.GridHelper(1000, 100); // 1000 size, 100 divisions
//scene.add(gridHelper);

//// Add floor with slight transparency
//const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
//const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, opacity: 0.5, transparent: true });
//const floor = new THREE.Mesh(floorGeometry, floorMaterial);
//floor.rotation.x = -Math.PI / 2;
//floor.position.set(0, -1, 0); // Slight offset to avoid overlapping with the grid
//scene.add(floor);

//// Create an instance of ViewHelper
//const viewHelper = new ViewHelper(camera, document.getElementById('editor-view')); // Pass the container element
//scene.add(viewHelper);

//// Optional: Set labels for the axes if needed
//viewHelper.setLabels('X Axis', 'Y Axis', 'Z Axis');

//// Animation loop
//function animate() {
//    requestAnimationFrame(animate);
//    controls.update();
//    renderer.render(scene, camera);
//}

//animate();
import * as THREE from '/lib/three/three.js';
import { OrbitControls } from '/lib/three/OrbitControls.js';
import { GLTFLoader } from '/lib/three/GLTFLoader.js';
import { FBXLoader } from '/lib/three/FBXLoader.js';
import { DragControls } from '/lib/three/DragControls.js';
import { ViewHelper } from '/main/Viewport.ViewHelper.js'; // Adjust the path as necessary

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xAAAAAA);

// Camera setup
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Renderer setup
const renderer = new THREE.WebGLRenderer();
document.getElementById('editor-view').appendChild(renderer.domElement);

// Adjust renderer size according to the div
function resizeRenderer() {
    const mainView = document.getElementById('editor-view');
    renderer.setSize(mainView.clientWidth, window.innerHeight);
    camera.aspect = mainView.clientWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
resizeRenderer(); // Initial resize
window.addEventListener('resize', resizeRenderer); // Adjust on window resize

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
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

// Floor with grid
const gridHelper = new THREE.GridHelper(1000, 100); // 1000 size, 100 divisions
scene.add(gridHelper);

// Add floor with slight transparency
const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, opacity: 0.5, transparent: true });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -1, 0); // Slight offset to avoid overlapping with the grid
scene.add(floor);

// Create an instance of ViewHelper

//// Optional: Set labels for the axes if needed
//viewHelper.setLabels('X Axis', 'Y Axis', 'Z Axis');

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
//randring scene controle navigation
const scenexyz = new THREE.Scene();
scenexyz.background = new THREE.Color(0xAAAAAA);

// Renderer setup
const rendererxyz = new THREE.WebGLRenderer();
document.getElementById('xyz-view').appendChild(rendererxyz.domElement);

const cameraxyz = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraxyz.position.set(0,2, 0);
const controlsxyz = new OrbitControls(cameraxyz, rendererxyz.domElement);
controlsxyz.enabled = false;
const lightxyz = new THREE.DirectionalLight(0xffffff, 5);
lightxyz.position.set(0, 0, 0).normalize();
scenexyz.add(lightxyz);

const uiContainer = document.getElementById('editor-view');
const viewHelper = new ViewHelper(camera, uiContainer);
scenexyz.add(viewHelper);
// Optional: Set labels for the axes if needed
viewHelper.setLabels('X', 'Y', 'Z');

function animatexyz() {
    requestAnimationFrame(animatexyz);
    controlsxyz.update();
    rendererxyz.render(scenexyz, cameraxyz);
}

animatexyz();