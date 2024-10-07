import { UIPanel } from '/main/ui.js';
import { ViewHelper as ViewHelperBase } from '/main/ViewHelper.js';

class ViewHelper extends ViewHelperBase {
    constructor(editorCamera, container) {
        super(editorCamera, container.dom);
        this.editorCamera = editorCamera;
        this.container = container;
        this.initPanel();
    }

    initPanel() {
        this.panel = new UIPanel();
        this.panel.setId('viewHelper');
        this.panel.setPosition('absolute');
        this.panel.setRight('0px');
        this.panel.setBottom('0px');
        this.panel.setHeight('128px');
        this.panel.setWidth('128px');
        this.panel.dom.style.zIndex = 1000;
        this.panel.dom.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';

        this.panel.dom.addEventListener('pointerup', (event) => {
            event.stopPropagation();
            this.handleClick(event);
        });

        this.panel.dom.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
        });

        this.container.appendChild(this.panel.dom);
    }

    handleClick(event) {
        const rect = this.panel.dom.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const regionWidth = rect.width / 3;

        if (x < regionWidth) {
            this.moveToFace('X');
        } else if (x < 2 * regionWidth) {
            this.moveToFace('Y');
        } else {
            this.moveToFace('Z');
        }
    }

    moveToFace(axis) {
        if (axis === 'X') {
            this.editorCamera.position.set(10, 0, 0);
        } else if (axis === 'Y') {
            this.editorCamera.position.set(0, 10, 0);
        } else if (axis === 'Z') {
            this.editorCamera.position.set(0, 0, 10);
        }
        this.editorCamera.lookAt(0, 0, 0);
    }
}

export { ViewHelper };
