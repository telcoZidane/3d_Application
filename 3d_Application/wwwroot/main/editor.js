import * as THREE from '/lib/three/three.js';
import { OrbitControls } from '/lib/three/OrbitControls.js';
import  '/main/tween.js'


// tables Assets 3D object 
const Assets3DObjects = [];

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xAAAAAA);

// Camera setup
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 5, 10);
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
floor.position.set(0, 0, 0); // Slight offset to avoid overlapping with the grid
scene.add(floor);

// Create a cube and add it to the scene
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
// UI Interaction for navigation
const uiContainer = document.getElementById('ui-container');

// Create buttons for navigation
['X', 'Y', 'Z'].forEach(axis => {
    const button = document.createElement('button');
    button.innerText = `Face ${axis}`;
    button.onclick = () => moveToFace(axis); // Attach click event
    uiContainer.appendChild(button);
});

// Move camera to face a specific axis with animation
function moveToFace(axis) {
    const targetPosition = new THREE.Vector3();
    
    if (axis === 'X') {
        targetPosition.set(10, 0, 0);
    } else if (axis === 'Y') {
        targetPosition.set(0, 10, 0);
    } else if (axis === 'Z') {
        targetPosition.set(0, 0, 10);
    }

    // Animation for smooth transition
    new TWEEN.Tween(camera.position)
        .to(targetPosition, 1000) // 1 second transition
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

    camera.lookAt(0, 0, 0); // Always look at the origin
}

// Function to fetch data from the local JSON file
async function fetch_Assets3D_Data() {
    try {
        const response = await fetch('main/Assets3D_Data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching model data:', error);
        return [];
    }
}

// API
function createAssets3DObjectFromAPI(modelData) {
    modelData.forEach(item => {
        Assets3DObjects.push(item);
        displayCartAssets3DObjects(item)
    });

}
function displayCartAssets3DObjects(model) {
    const Assets3Dcart = document.getElementById('canva_Assets_3D_objects');

    // Populate the status card with model information
    Assets3Dcart.innerHTML += `
    <div id="id_${model.ID}" class="card w-20 mt-3" >
        <img src="${model.img}" class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-text text-center">${model.name}</h5>
        </div>
    </div>`;



    if (document.getElementById(`id_${model.ID}`)) {
        document.getElementById(`id_${model.ID}`).addEventListener('click', function () {
            alert(`id_${model.ID}`);
            console.log(`id_${model.ID}`);
        });
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update(); // Update tween animations
    renderer.render(scene, camera);
}
fetch_Assets3D_Data().then(data => {
    createAssets3DObjectFromAPI(data);
});


animate();
