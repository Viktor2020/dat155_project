let instance = null;

class State {
    constructor() {

        // Singleton setup
        if (instance) {
            return instance;
        } else {
            instance = this;
        }

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene = new THREE.Scene();

        // Create renderer, set antialias to true if possible
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        document.body.appendChild(this.renderer.domElement);

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        return instance;
    }

    // Use this to get a reference to State object (can also just use new, same stuff, but this is alike to Java)
    static getInstance() {
        if (instance) {
            return instance;
        } else {
            return new State();
        }
    }
}


// entry point to our application
class App {

    constructor() {
        this.state = State.getInstance(); // get the state
        this.solarSystem = new SolarSystem(this.state); // Get the solar system and inject the state

        // Create atmospheric white light
        let amb = new THREE.AmbientLight(0xFFFFFF);
        this.state.scene.add(amb);

        // Add camera to scene
        this.state.scene.add(this.state.camera);
        this.state.camera.position.z = 50;  // move alittle

        // Clear window to black and set size
        this.state.renderer.setClearColor(0x000000);

        // handle window resizing.
        window.addEventListener("resize", () => {
            this.state.renderer.setSize(window.innerWidth, window.innerHeight);
            this.state.camera.aspect = window.innerWidth / window.innerHeight;
            this.state.camera.updateProjectionMatrix();
        });

        this.render();  // start rendering
    }

    // Render the scene
    render() {
        this.solarSystem.animate(); // call our solarSystem's animation method

        // Perform the render of the scene from our camera's point of view
        this.state.renderer.render(this.state.scene, this.state.camera);

        // this line loops the render call, remember to bind our context so we can access our stuff!
        window.requestAnimFrame(this.render.bind(this));
    }
}


// shim layer with setTimeout fallback (ignore this)
window.requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


