import * as THREE from '/lib/three/three.js';
import { GLTFLoader } from '/lib/three/GLTFLoader.js'; 
import { FBXLoader } from '/lib/three/FBXLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xAAAAAA);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 10, 3);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3d').appendChild(renderer.domElement);

const directionalLightLeft = new THREE.DirectionalLight(0xffffff, 5);
directionalLightLeft.position.set(10, 10, 10).normalize();
scene.add(directionalLightLeft);

const directionalLightRight = new THREE.DirectionalLight(0xffffff, 5);
directionalLightRight.position.set(-10, 10, 10).normalize();
scene.add(directionalLightRight);

// Path to save images
const savePath = '/wwwroot/objImgcapture/';

// Load objects and render
function loadObjects(listModels) {
    // Function to remove only 3D objects and keep the camera and lights
    listModels.forEach(object => {

        // Load each 3D object
        const loader = object.path.endsWith('.glb') ? new GLTFLoader() : new FBXLoader();
        loader.load(object.path, (gltf) => {
            let md = object.path.endsWith('.glb') ? gltf.scene : gltf; // Fixed .scene for GLTF files
            scene.add(md);

            checkAndCaptureImage(object, md);
        }, undefined, function (error) {
            console.error('An error occurred while loading the model:', error);
        });
    });

   // window.location.href = window.location.origin + '/editor';
}

// Check image and capture if necessary
function checkAndCaptureImage(object, model) {
    if (!object.img || object.img === "") {
        console.log(`Capturing image for object: ${object.name} (${object.ID})`);
        captureImage(object, model);
    } else {
        console.log(`Object ${object.name} (${object.ID}) already has an image.`);
    }
}

// Capture the current rendering of the object
function captureImage(object, model) {
    // Center the model in the view
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    camera.position.set(center.x, center.y, center.z + size * 2);
    camera.rotation.set(0, Math.PI/2, 0);
    // Adjust camera distance
    camera.lookAt(center); // Look at the center of the model

    // Render the scene
    renderer.render(scene, camera);

    // Capture the image as Base64
    const imageData = renderer.domElement.toDataURL("image/png"); // Fixed renderer method
    const newImageName = `IMG_OBJ_${object.ID}.png`;
    scene.remove(model);
    // Save the captured image
    saveImageToPath(imageData, newImageName, object);
}

// Save the image to the server
function saveImageToPath(base64Image, imageName, object) {
    const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    const savePath = '/wwwroot/objImgcapture/' + imageName;

    fetch('https://localhost:7161/api/thumbnail/save-thumbnail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Data, path: savePath })
    })
        .then(response => response.json())
        .then(data => {
            console.log(`Image saved: ${imageName}`, data);
            object.img = imageName; // Update object with the new image name
        })
        .catch(error => console.error('Error saving image:', error));
}

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
fetchAssets3DData().then(data => {
    loadObjects(data);
});

// Run the loader


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
