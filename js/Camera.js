//https://github.com/mrdoob/three.js/blob/master/examples/js/controls/PointerLockControls.js.js
/**
 * This requires an element that can be used as a button to activate the pointerLock and enable camera movement.
 *
 * Movement:
 * Mouse to rotate camera.
 * W A S D to navigate xz-axis.
 * Space to move up y-axis and c to move down y-axis
 */
class Camera {
    /**
     *
     * @param camera a Threejs camera object
     * @param pointerTarget element id, should be the id of the element that contains the graphics. Pointer lock will be requested when this element is clicked.
     */
    constructor(camera, pointerTarget = 'container') {
        this.controls = new THREE.PointerLockControls( camera );
        this.camera = this.controls.getObject();

        //element id, the element will be used as a button to activate pointerLock
        this.pointerTarget = pointerTarget;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;

        document.addEventListener( 'keydown', this.onKeyDown.bind(this), false );
        document.addEventListener( 'keyup', this.onKeyUp.bind(this), false );

        this.preparePointerLock();

    }//end constructor


    /**
     * returns the controllers camera object. Use this object to make changes to the camera.
     * @returns {this.controller.getObject()}
     */
    getObject() {return this.camera;}

    //add event listeners for locking and unlocking the pointer
    /**
     * Make browser is compatible with pointerLocks, adds eventListeners.
     */
    preparePointerLock() {
        this.container = document.getElementById( 'container' );
        this.havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
        this.element = document.body;

        if ( this.havePointerLock ) {

            // Hook pointer lock state change events
            document.addEventListener( 'pointerlockchange', this.pointerlockchange.bind(this), false );
            document.addEventListener( 'mozpointerlockchange', this.pointerlockchange.bind(this), false );
            document.addEventListener( 'webkitpointerlockchange', this.pointerlockchange.bind(this), false );
            document.addEventListener( 'pointerlockerror', this.pointerlockerror.bind(this), false );
            document.addEventListener( 'mozpointerlockerror', this.pointerlockerror.bind(this), false );
            document.addEventListener( 'webkitpointerlockerror', this.pointerlockerror.bind(this), false );

            this.container.addEventListener( 'click', this.lockPointer.bind(this) , false );
        } else {

        }

    }

    //called when click event happens, locks the pointer for use in animation
    /**
     * Event handler for ClickEvent, called when user clicks on the graphics container and sends a request to the browser, for it to lock the pointer.
     * This will in turn fire the pointerLockChange event or a pointerlockerror if anything goes wrong.
     * @param event
     */
    lockPointer(event) {
        document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
        document.body.requestPointerLock();
    }

    /**
     * Event handler for pointerLockError, called when an error occurs
     * @param event
     */
    pointerlockerror( event ) {

    }

    /**
     * Event handler for pointerLockChange, called when pointer is locked or released
     * @param event
     */
    pointerlockchange( event ) {
        if ( document.pointerLockElement === this.element || document.mozPointerLockElement === this.element || document.webkitPointerLockElement === this.element ) {
            this.controls.enabled = true;
        } else {
            this.controls.enabled = false;
        }
    }


    /**
     * Should be used in the update / animate function and be called every frame.
     * Moves the camera if buttons are pressed and pointer is locked.
     * @param delta Time between this frame and the last, used to make movement consistent between frames.
     */
    animate(delta) {

        //as long as pointer is not locked in, controls will not work
        if(!this.controls.enabled) return;

        let x = 0;
        let y = 0;
        let z = 0;

        //add velocity in a particular direction
        //multiply by delta to ensure same speed between frames
        x += this.moveRight ? 10 : 0;
        x -= this.moveLeft ? 10 : 0;

        z -= this.moveForward ? 10 : 0;
        z += this.moveBackward ? 10 : 0;

        y += this.moveUp ? 10 : 0;
        y -= this.moveDown ? 10 : 0;

        //console.log(this.moveForward);

        this.camera.translateX(x * delta);
        this.camera.translateY(y * delta);
        this.camera.translateZ(z * delta);

    }

    //stopper bevegelse når knappen slippes
    /**
     * Event handler for onKeyUp, camera will stop moving when key is not held down
     * @param event
     */
    onKeyUp(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;
            case 32: // spacebar
                this.moveUp = false;
                break;
            case 67: // c
                this.moveDown = false;
                break;
        }//end switch
    }//end onKeyUp

    //starter bevegelse når knapp trykkes inn
    /**
     * Event handler for onKeyDown event, moves camera as long os the key is held down
     * @param event
     */
    onKeyDown(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
            case 32: // spacebar
                this.moveUp = true;
                break;
            case 67: // c
                this.moveDown = true;
                break;
        }//end switch
    }//end onkeydown



}//end class