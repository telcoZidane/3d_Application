import { UIPanel } from '/main/ui.js';

class ViewHelper {
    constructor(editorCamera, container) {
        this.editorCamera = editorCamera;
        this.container = container;
        this.panel = new UIPanel();
        this.initPanel();
    }

    initPanel() {
        this.panel.setId('viewHelper');
        this.panel.setPosition('absolute');
        this.panel.setRight('0px');
        this.panel.setBottom('0px');
        this.panel.setHeight('128px');
        this.panel.setWidth('128px');

        this.panel.dom.addEventListener('pointerup', (event) => {
            event.stopPropagation();
            this.handleClick(event);
        });

        this.panel.dom.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
        });

        this.container.appendChild(this.panel.dom); // Use appendChild instead of container.add
    }

    handleClick(event) {
        const rect = this.panel.dom.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Here, you can add logic to determine if X or Y was clicked based on x and y coordinates
        // For example:
        if (x < rect.width / 2) {
            this.moveToFace('X'); // Move to face the X axis
        } else {
            this.moveToFace('Y'); // Move to face the Y axis
        }
    }

    moveToFace(axis) {
        // Logic to move the camera to face the specified axis
        if (axis === 'X') {
            this.editorCamera.position.set(10, 0, 0); // Example position
            this.editorCamera.lookAt(0, 0, 0);
        } else if (axis === 'Y') {
            this.editorCamera.position.set(0, 10, 0); // Example position
            this.editorCamera.lookAt(0, 0, 0);
        }
    }
}

export { ViewHelper };
