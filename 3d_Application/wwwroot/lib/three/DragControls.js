// DragControls.js
import {
    EventDispatcher,
    Matrix4,
    Plane,
    Raycaster,
    Vector2,
    Vector3
} from './three.js';

var _plane = new Plane();
var _raycaster = new Raycaster();
var _mouse = new Vector2();
var _offset = new Vector3();
var _intersection = new Vector3();
var _worldPosition = new Vector3();
var _inverseMatrix = new Matrix4();

class DragControls extends EventDispatcher {

    constructor(_objects, _camera, _domElement) {

        super();

        _domElement.style.touchAction = 'none'; // disable touch scroll

        var _selected = null, _hovered = null;

        const scope = this;

        function activate() {

            _domElement.addEventListener('pointermove', onPointerMove);
            _domElement.addEventListener('pointerdown', onPointerDown);
            _domElement.addEventListener('pointerup', onPointerCancel);
            _domElement.addEventListener('pointerleave', onPointerCancel);

        }

        function deactivate() {

            _domElement.removeEventListener('pointermove', onPointerMove);
            _domElement.removeEventListener('pointerdown', onPointerDown);
            _domElement.removeEventListener('pointerup', onPointerCancel);
            _domElement.removeEventListener('pointerleave', onPointerCancel);

        }

        function dispose() {

            deactivate();

        }

        function onPointerMove(event) {

            _mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            _mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            _raycaster.setFromCamera(_mouse, _camera);

            if (_selected) {

                if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

                    _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));

                }

                scope.dispatchEvent({ type: 'drag', object: _selected });

                return;

            }

            // hover support

            const intersects = _raycaster.intersectObjects(_objects, true);

            if (intersects.length > 0) {

                const object = intersects[0].object;

                _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), _worldPosition.setFromMatrixPosition(object.matrixWorld));

                if (_hovered !== object) {

                    scope.dispatchEvent({ type: 'hoveron', object: object });

                    _domElement.style.cursor = 'pointer';
                    _hovered = object;

                }

            } else {

                if (_hovered !== null) {

                    scope.dispatchEvent({ type: 'hoveroff', object: _hovered });

                    _domElement.style.cursor = 'auto';
                    _hovered = null;

                }

            }

        }

        function onPointerDown(event) {

            _mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            _mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            _raycaster.setFromCamera(_mouse, _camera);

            const intersects = _raycaster.intersectObjects(_objects, true);

            if (intersects.length > 0) {

                _selected = intersects[0].object;

                _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), _worldPosition.setFromMatrixPosition(_selected.matrixWorld));

                if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

                    _inverseMatrix.copy(_selected.parent.matrixWorld).invert();
                    _offset.copy(_intersection).sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));

                }

                _domElement.style.cursor = 'move';

                scope.dispatchEvent({ type: 'dragstart', object: _selected });

            }

        }

        function onPointerCancel() {

            if (_selected) {

                scope.dispatchEvent({ type: 'dragend', object: _selected });

                _selected = null;

            }

            _domElement.style.cursor = _hovered ? 'pointer' : 'auto';

        }

        activate();

        // API

        this.enabled = true;

        this.activate = activate;
        this.deactivate = deactivate;
        this.dispose = dispose;

    }

}

export { DragControls };
