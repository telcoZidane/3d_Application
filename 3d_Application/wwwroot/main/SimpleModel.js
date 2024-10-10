import * as THREE from '/lib/three/three.js';
import { GLTFLoader } from '/lib/three/GLTFLoader.js';
import { FBXLoader } from '/lib/three/FBXLoader.js';
import { ModelsType, ModelStatus, EnumHandler } from './EnumHandler.js'; // Import enums and EnumHandler

export let complitedLoading =false;
export const IsTestMode = false;
export const MODELS = [];
export class SimpleModel {

    constructor(id, url, position, scale, type, status, description, rotation, components = []) {
        this.id = id;
        this.url = url;
        this.position = position;
        this.scale = scale;
        this.type = type;
        this.model = null;
        this.status = status;
        this.description = description;
        this.rotation = rotation;
        this.components = components;
    }

    load(scene) {
        complitedLoading = false;
        // Add zone cube here ...
        if (this.type === ModelsType.CUBEZONE_MODEL.value) {
            const roomGeometry = new THREE.BoxGeometry(this.scale.x, this.scale.y, this.scale.z);
            const roomMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
            const roomCube = new THREE.Mesh(roomGeometry, roomMaterial);

            // Set position and add to the scene
            roomCube.position.set(this.position.x, this.position.y, this.position.z);
            roomCube.rotation.set(Math.PI * this.rotation.x, Math.PI * this.rotation.y, Math.PI * this.rotation.z);
            roomCube.userData = { parentModel: this };
            roomCube.visible = IsTestMode;
            scene.add(roomCube);
            MODELS.push(this);
        }
        else {
            const loader = this.url.endsWith('.glb') ? new GLTFLoader() : new FBXLoader();

            loader.load(this.url, (object) => {
                this.model = this.url.endsWith('.glb') ? object.scene : object;
                this.model.position.set(this.position.x, this.position.y, this.position.z);
                this.model.scale.set(this.scale.x, this.scale.y, this.scale.z);

                // Apply rotation
                this.model.rotation.set(Math.PI * this.rotation.x, Math.PI * this.rotation.y, Math.PI * this.rotation.z);

                // Traverse the model and set userData for meshes
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.userData = { parentModel: this };
                        child.material.transparent = true;
                        child.material.opacity = 0.5;
                    }
                });
                MODELS.push(this);
                scene.add(this.model);
                this.updateColor();
                // Load child components if any
                if (this.components.length > 0) {
                    this.loadComponents(scene);
                }

                // Set initial color based on status
                
            }, undefined, (error) => {
                console.error('Error loading model:', error);
            });
        }
    }

    loadComponents(scene) {
        this.components.forEach(componentData => {
            const component = new SimpleModel(
                componentData.id,
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
                componentData.rotation
            );
            component.load(scene);
            
           
        });
        complitedLoading = true;
    }

    setOpacity(opacity) {
        const obj = MODELS.find(model => model.id === this.id); // Find the model with matching id
        if (obj && obj.model) {
            obj.model.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true; // Enable transparency
                    child.material.opacity = opacity;  // Set the desired opacity
                }
            });
        } else {
            console.warn(`Model with id ${this.id} not found in MODELS.`);
        }
    }

    updateColor() {
        if (this.model) {
            if (this.type !== ModelsType.SUPPER_MODEL.value) {
                const color = this.status === ModelStatus.Working.value ? 0x00ff00 : 0xff0000;
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.material.color.set(color);
                    }
                });
            }
        }
    }
}
