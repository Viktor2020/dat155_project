
/**
 * Our solar system. Remember, Separation of Concerns is the most important design pattern!
 */
class SolarSystem {

    constructor(state) {
        this.state = state; // Store the injected state

        // define sun settings
        let sunTextureUrl = 'textures/texture_sun.jpg';
        let radius = 5;
        let widthSegments = 16;
        let heightSegments = 16;

        // Create the sun
        this.sun = this.createTexturedPhongPlanet(radius, widthSegments, heightSegments, sunTextureUrl);
        this.sun.name = 'sun';

        // Add sun to the scene
        this.state.scene.add(this.sun);

        //-----------------------Light----------------------------
        // create a point light and set it as a child of the sun (so the sun shines), use 5 as intensity (play around and see what this does for yourselves)
        this.sunlight = new THREE.PointLight(0xFFFFFF, 5);
        this.sun.add(this.sunlight);
        //TODO fiddle with directional lights for shady efffects


        //--------------------Mercury----------------------
        // mercury orbit node
        this.mercuryOrbitAroundSun = new THREE.Object3D();
        this.sun.add(this.mercuryOrbitAroundSun);

        // after the sun has been added, add the mercury to it's first orbit
        radius = 1.0;   // change to very unrealistic, but at least smaller, radius
        let mercuryTextureUrl = 'textures/texture_mercury.jpg';

        // Create and add mercury
        this.mercury = this.createTexturedPhongPlanet(radius, widthSegments, heightSegments, mercuryTextureUrl);
        this.mercury.name = 'mercury';
        this.mercury.castShadow = true;
        // inner most planet no shadow to recive

        // Translate mercury out from the sun
        this.mercury.position.x = 10;
        this.mercuryOrbitAroundSun.add(this.mercury);

        //-----------------------Venus-------------------------
        // venus orbit node
        this.venusOrbitAroundSun = new THREE.Object3D();
        this.sun.add(this.venusOrbitAroundSun);


        // after the sun has been added, add the mercury to it's first orbit
        radius = 2.0;   // change to very unrealistic, but at least smaller, radius
        let venusTextureUrl = 'textures/texture_venus.jpg'; //Texture OK

        // Create and add mercury
        this.venus = this.createTexturedPhongPlanet(radius, widthSegments, heightSegments, venusTextureUrl);
        this.venus.name = 'venus';
        this.venus.castShadow = true;
        this.venus.receiveShadow = true;

        // Translate mercury out from the sun
        this.venus.position.x = 20; // Position change OK
        this.venusOrbitAroundSun.add(this.venus);


        //-----------------------Earth----------------------------
        // Create an orbit node for the earth around the sun (Same concept as the WebGLScenegraph)
        this.earthOrbitAroundSun = new THREE.Object3D();
        this.sun.add(this.earthOrbitAroundSun);

        // after the sun has been added, add the earth to it's third orbit
        radius = 2.5;   // change to very unrealistic, but at least smaller, radius
        let earthTextureUrl = 'textures/texture_earth.jpg';

        // Create and add earth
        this.earth = this.createTexturedPhongPlanet(radius, widthSegments, heightSegments, earthTextureUrl);
        this.earth.name = 'earth';
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;

        // Translate earth out from the sun
        this.earth.position.x = 30;
        this.earthOrbitAroundSun.add(this.earth);

        // -----------------------The Moon -----------------------
        // Create an orbit node for the moon around the earth
        this.moonOrbitAroundEarth = new THREE.Object3D();
        this.earth.add(this.moonOrbitAroundEarth);

        // after the earth has been added, add the moon to it's orbit
        radius = 0.5;   // change to very unrealistic, but at least smaller, radius
        let moonTextureUrl = 'textures/texture_moon.jpg';

        // Create and add earth
        this.moon = this.createTexturedPhongPlanet(radius, widthSegments, heightSegments, moonTextureUrl);
        this.moon.name = 'moon';
        this.moon.receiveShadow = true;
        this.moon.castShadow = true;

        // Translate the moon out from the earth
        this.moon.position.x = 5;
        this.moonOrbitAroundEarth.add(this.moon);
    }

    createTexturedPhongPlanet(radius, widthSegments, heightSegments, textureUrl) {

        let tex = new THREE.TextureLoader().load(textureUrl);
        let planetGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

        // Create our sun's material, making it a Phong material so it supports light.
        let planetMaterial = new THREE.MeshPhongMaterial({ map: tex });
        let planet = new THREE.Mesh(planetGeometry, planetMaterial);

        return planet;
    }

    // Lets do all the updating of our objects in this method, so we can just call this from the render method in app.js!
    animate() {
        this.rotateObject(this.sun, [0.0, 0.01, 0.0]);
        // Mercury
        this.rotateObject(this.mercuryOrbitAroundSun, [0.0, 0.009, 0.0]);
        this.rotateObject(this.mercury, [0.0, 0.05, 0.0]);
        // Venus
        this.rotateObject(this.venusOrbitAroundSun, [0.0, 0.006, 0.0]);
        this.rotateObject(this.venus, [0.0, 0.02, 0.0]);
        //Earth
        this.rotateObject(this.earthOrbitAroundSun, [0.0, 0.001, 0.0]);
        this.rotateObject(this.earth, [0.0, 0.02, 0.0]);
        // The Moon
        this.rotateObject(this.moonOrbitAroundEarth, [0.0, 0.01, 0.0]);
        //this.rotateObject(this.earth, [0.0, 0.00, 0.0]); // The moon keeps its face towards the eart at all times, no rotation
    }

    // Helper function
    rotateObject(object, rotation) {
        object.rotation.x += rotation[0];
        object.rotation.y += rotation[1];
        object.rotation.z += rotation[2];
    }
}
