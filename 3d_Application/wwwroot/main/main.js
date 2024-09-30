import * as THREE from '/lib/three/three.js';
import { OrbitControls } from '/lib/three/OrbitControls.js';
import { GLTFLoader } from '/lib/three/GLTFLoader.js';
import { FBXLoader } from '/lib/three/FBXLoader.js';
import { DragControls } from '/lib/three/DragControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
resizeRenderer(); // Initial resize
window.addEventListener('resize', resizeRenderer); // Adjust on window resize

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.2;
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

// Add floor
const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -1, 0); // Rotate floor to be horizontal
scene.add(floor);

let models = [];
let modelsCubeZone = [];
let complitedLoading = false;
let draggableObjects = []; // Store draggable objects here
let enabledDragModels = []; // Store models that can be dragged

// Function to fetch data from the local JSON file
async function fetchModelData() {
    try {
        const response = await fetch('main/models.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching model data:', error);
        return [];
    }
}

// EnumHandler, ModelsType, ModelStatus remain the same
class EnumHandler {
    constructor(enumObject) {
        this.enumObject = enumObject;
    }

    getDisplayNameByValue(value) {
        for (const key in this.enumObject) {
            if (this.enumObject[key].value === value) {
                return this.enumObject[key].displayName;
            }
        }
        return null;
    }

    getDisplayNameByKey(key) {
        return this.enumObject[key]?.displayName || null;
    }
}

const ModelsType = Object.freeze({
    SUPPER_MODEL: { displayName: "Office Model", value: 1 },
    PC_MODEL: { displayName: "PC Model", value: 2 },
    CUBEZONE_MODEL: { displayName: "Cube zone Model", value: 3 },
});

const ModelStatus = Object.freeze({
    Suppoer: { displayName: "Support Model", value: 0 },
    Working: { displayName: "Working", value: 1 },
    Not_Working: { displayName: "Not Working", value: 2 },
});

const modelsTypeHandler = new EnumHandler(ModelsType);
const modelStatusHandler = new EnumHandler(ModelStatus);

class SimpleModel {
    constructor(url, position, scale, type, status, description, rotation, components = []) {
        this.url = url;
        this.position = position;
        this.scale = scale;
        this.type = type;
        this.model = null;
        this.status = status;
        this.description = description;
        this.rotation = rotation; // Added rotation property
        this.components = components;  // To store child components like PCs
    }

    load(scene) {
        // Add zone cube hire ...
        if (this.type === ModelsType.CUBEZONE_MODEL.value) {
            const roomGeometry = new THREE.BoxGeometry(this.scale.x, this.scale.y, this.scale.z); // Adjust size as needed
            const roomMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
            const roomCube = new THREE.Mesh(roomGeometry, roomMaterial);

            // Set position and add to the scene
            roomCube.position.set(this.position.x, this.position.y, this.position.z);
            roomCube.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
            roomCube.userData = { parentModel: this };
            scene.add(roomCube);
        }
        else {

            const loader = this.url.endsWith('.glb') ? new GLTFLoader() : new FBXLoader();

            loader.load(this.url, (object) => {
                this.model = this.url.endsWith('.glb') ? object.scene : object;
                this.model.position.set(this.position.x, this.position.y, this.position.z);
                this.model.scale.set(this.scale.x, this.scale.y, this.scale.z);

                // Apply rotation
                this.model.rotation.set(
                    this.rotation.x,
                    this.rotation.y,
                    this.rotation.z
                );

                // Traverse the model and set userData for meshes
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.userData = { parentModel: this };
                        // Set opacity to 0.5 on load
                        child.material.transparent = true;
                        child.material.opacity = 0.5;
                    }
                });

                scene.add(this.model);

                // Load child components if any
                this.loadComponents(scene);

                // Set initial color based on status
                this.updateColor();
            }, undefined, (error) => {
                console.error('Error loading model:', error);
            });
        }

    }

    loadComponents(scene) {
        this.components.forEach(componentData => {
                const component = new SimpleModel(
                    componentData.url,
                    {
                        x: this.position.x + componentData.position.x,
                        y: this.position.y + componentData.position.y,
                        z: this.position.z + componentData.position.z,
                    },
                    componentData.scale,
                    componentData.type,
                    componentData.status,
                    componentData.description,
                    componentData.rotation // Pass rotation to the component
                );
            component.load(scene);
            if (component.type === ModelsType.CUBEZONE_MODEL.value) {
                if (!modelsCubeZone.includes(component)) {
                    modelsCubeZone.push(component);
                }
            }
            models.push(component);
        });
        complitedLoading = true;
    }

    setOpacity(opacity) {
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                }
            });
        }
    }

    updateColor() {
        if (this.model) {
            if (this.type !== 1) {
                const color = this.status === 1 ? 0x00ff00 : 0xff0000; // Green if active, red otherwise
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.material.color.set(color);
                    }
                });
            }
        }
    }
}

// Function to create models from the local JSON data
function createModelsFromAPI(modelData) {
    modelData.forEach(item => {
        const model = new SimpleModel(
            item.url,
            item.position,
            item.scale,
            item.type,
            item.status,
            item.description,
            item.rotation, // Use rotation from JSON
            item.components
        );
        model.load(scene);
        models.push(model);
    });

    // Setup Drag Controls without any draggable objects initially
    setupDragControls();
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
function enableDragging(model) {
    if (!enabledDragModels.includes(model.model)) {
        enabledDragModels.push(model.model); // Add the model to the list of draggable objects
    }

    // Re-setup DragControls with the new draggable models
    setupDragControls();
}

// Function to display the status card with a button to enable dragging
function displayStatusCard(model) {
    const statusCard = document.getElementById('status-card');
    statusCard.style.display = 'block';

    // Add a button to toggle dragging
    statusCard.innerHTML = `
        <h3>${modelsTypeHandler.getDisplayNameByValue(model.type)} Status</h3>
        <p>Position: X=${model.position.x}, Y=${model.position.y}, Z=${model.position.z}</p>
        <p>Status: ${modelStatusHandler.getDisplayNameByValue(model.status) || 'N/A'}</p>
        <p>Description: ${model.description || 'No description available'}</p>
        ${(model.type !== ModelsType.SUPPER_MODEL.value && model.type !== ModelsType.CUBEZONE_MODEL.value) ? '<button class="btn btn-primary" id="enable-drag-btn">Enable Drag</button>' : ''}
    `;

    // Add event listener to the button to enable dragging
    const dragButton = document.getElementById('enable-drag-btn');
    if (dragButton) {
        dragButton.addEventListener('click', function () {
            enableDragging(model);
        });
    }
}

function displayZoneButton(models) {
    const zoneButtonContainer = document.getElementById('mySidenav'); // Ensure this element exists
    zoneButtonContainer.innerHTML =  '<a class="closebtn" onclick="closeNav()">&times;</a>'; // Clear existing buttons

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
            models.forEach(model => {
                if (model !== parentModel) {
                    model.setOpacity(0.5);
                } else {
                    // Only move camera if the model type is not 'support'
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

// Function to move camera to the selected object
function moveCameraToTarget(target) {
    const targetPosition = new THREE.Vector3();
    target.getWorldPosition(targetPosition);
    targetPosition.set(targetPosition.x + 3, targetPosition.y + 2, targetPosition.z);

    const startPosition = camera.position.clone();
    const startTime = performance.now();
    const duration = 1000;

    function animateCamera(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);

        camera.position.lerpVectors(startPosition, targetPosition, t);
        
        camera.lookAt(targetPosition);
        camera.rotation.set(target.rotation.x, target.rotation.y, target.rotation.z);

        if (t < 1) {
            requestAnimationFrame(animateCamera);
        }
    }

    requestAnimationFrame(animateCamera);
}

function moveCameraToZone(model) {
    const offset = new THREE.Vector3(
        model.scale.x ,
        model.scale.y , 
        model.scale.z  
    );

    const targetPosition = new THREE.Vector3();
    targetPosition.set(
        model.position.x - (offset.x/2) + 2,
        model.position.y + (offset.y/2) -3,
        model.position.z + (offset.z/2) - 1
    );

    const startPosition = camera.position.clone();
    const startTime = performance.now();
    const duration = 1000;

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
        }
    }

    requestAnimationFrame(animateCamera);
}


// Fetch model data and load models
fetchModelData().then(data => {
    createModelsFromAPI(data);
});

// Event listener for mouse click
renderer.domElement.addEventListener('click', onMouseClick);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    console.log("camera position | X : " + camera.position.x + " Y: " + camera.position.y + " Z:" + camera.position.z);
    console.log("camera Rotation | X : " + camera.rotation.x + " Y: " + camera.rotation.y + " Z:" + camera.rotation.z);

    if (complitedLoading) {
        displayZoneButton(modelsCubeZone);
        complitedLoading = false;
    }
}

animate();


