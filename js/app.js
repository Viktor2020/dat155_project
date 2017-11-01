"use strict";

let instance = null;

class State {
    constructor() {

        // Singleton setup
        if (instance) {
            return instance;
        } else {
            instance = this;
        }

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
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

    static loadTree() {
        let objectAndMaterialLoader = new THREE.OBJMTLLoader();
        let object;
        objectAndMaterialLoader.load(
            'resources/3Dmodels/lowPolyTree/lowpolytree.obj',
            'resources/3Dmodels/lowPolyTree/lowpolytree.mtl',
            function (loadedObject) {
                "use strict";
                // Custom function to handle what's supposed to happen once we've loaded the model

                let bbox = new THREE.Box3().setFromObject(loadedObject);
                console.log(bbox);

                for (let i = 0; i < numObjects; ++i) {
                    object = loadedObject.clone();

                    // We should know where the bottom of our object is
                    object.position.copy(generatedAndValidPositions[i]);
                    object.position.y -= bbox.min.y*generatedAndValidScales[i];

                    object.scale.set(
                        generatedAndValidScales[i],
                        generatedAndValidScales[i],
                        generatedAndValidScales[i]
                    );

                    object.name = "LowPolyTree";

                    //terrain.add(object);
                }
            }, onProgress, onError);
        return object;
    }
}


// entry point to our application
class App {

    //load all object models
    loadModels() {
        return new Promise((resolve, reject) => {
            // instantiate the loader
            let loader = new THREE.OBJLoader2();

            let models = [
                tree: {
                    url: 'resources/3Dmodels/lowPolyTree/lowpolytree.obj',
                    object: null
                },
                rock: {
                    url: 'resources/3Dmodels/rocks/rock.obj',
                    object: null
                },
            ];

            // Gir støtte for asynkron lasting av modeller
            let promises = [];

            models.forEach((model) => {
                // load a resource from provided URL
                promises.push(new Promise((resolve, reject) => {
                    loader.load(model.url, (object) => {
                        model.object = object;
                        resolve(model);
                    });
                }));
            });

            return Promise.all(promises);
        });
    }

    constructor() {
        this.state = State.getInstance(); // get the state

        // last in modeller:
        this.loadModels().then((models) => {
            // do something with the models.
            // f.eks. scene.add(models[0]);
        }).catch((error) => {
            // an error occured while loading.
        })

        // Create atmospheric white light
        let ambientLight = new THREE.AmbientLight(0xFFFFFF);
        this.state.scene.add(ambientLight);

        // example:
        //let terrain = new Terrain({...});
        //this.state.scene.add(terrain);

        // Add camera to scene
        this.state.scene.add(this.state.camera);
        this.state.camera.position.z = 50;

        // Clear window to black and set size
        this.state.renderer.setClearColor(0xFFFFFF);

        // handle window resizing.
        window.addEventListener("resize", () => {
            this.state.renderer.setSize(window.innerWidth, window.innerHeight);
            this.state.camera.aspect = window.innerWidth / window.innerHeight;
            this.state.camera.updateProjectionMatrix();
        });

        this.loop();  // start rendering
    }

    // Render the scene
    loop() {
        // perform updates, animations etc.:
        // here

        // Perform the render of the scene from our camera's point of view
        this.state.renderer.render(this.state.scene, this.state.camera);

        // this line loops the render call, remember to bind our context so we can access our stuff!
        window.requestAnimFrame(this.loop.bind(this));
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
