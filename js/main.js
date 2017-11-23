"use strict";

window.addEventListener('load', () => {
	let app = new App();

	// setup terrain.
	app.extend(Utilities.loadImage('resources/textures/heightmap.png').then((heightmapImage) => {
		// return the callback function that will be called once the heightmap has been loaded.
		return (app) => {
			let width = 3000;

			let geometry = new TerrainBufferGeometry({
				heightmapImage,
				width,
				height: 450,
				levelsOfDetail: 5,
				numberOfSubdivisions: 16
			});

			let grass = new THREE.TextureLoader().load('resources/textures/grass_01.jpg');
	    	grass.wrapS = THREE.RepeatWrapping;
			grass.wrapT = THREE.RepeatWrapping;
			grass.repeat.set(width/40, width/40);

	        let snowyRock = new THREE.TextureLoader().load('resources/textures/snowy_rock_01.png');
	        snowyRock.wrapS = THREE.RepeatWrapping;
	        snowyRock.wrapT = THREE.RepeatWrapping;
	        snowyRock.repeat.set(width/80, width/80);

        	let splatMap1 = new THREE.TextureLoader().load('resources/textures/splatmap_01.png');

	        let material = new TextureSplattingMaterial({
	            color: 0x777777,
	            shininess: 0,
	            textures: [snowyRock, grass],
	            splatMaps: [splatMap1]
	        });

			app.terrain = new THREE.Mesh(geometry, material);
			app.terrain.position.x = -width/2;
			app.terrain.position.z = -width/2;

			app.scene.add(app.terrain);

			let light = new THREE.DirectionalLight( 0xffffff, 2);
			light.position.set(0.01, 1, 0);
			app.scene.add(light); // for testing purposes.
		};
	}));

    //TODO Load a list of objects!
    let aName = 'lowpolytree';
    let objectNames = [aName];
    let path = 'resources/3Dmodels/';
    //let deco = new Decorations({objectNames});
    //let objects = deco.objectList;
    //let objects = [];
    let objects =  new THREE.Object3D();

        console.log(objectNames[0]);
    let name = objectNames[0];
    console.log(name);
    //Asynchronous loading
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath(path);
    //name++/++name
    console.log(name.concat('/').concat(name.concat('.mtl')));
    mtlLoader.load( name.concat('/').concat(name.concat('.mtl')), function (materials) {
        materials.preload();
        let objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(path);
        objLoader.load(name.concat('/').concat(name.concat('.obj')), function (obj) {
            obj.name = name;
            obj.position.set(0, 120, 0);
            obj.scale.set(50, 50, 50);
            objects.add(obj);
        });
    });

    app.scene.add(objects);

    //Load object done

	// setup camera.
	app.extend((app) => {
		let controls = new CameraControls(app.camera, app.renderer.domElement);
		app.scene.add(controls.object);
		controls.object.position.z = 0;
		controls.object.position.y = 350;

		controls.movementSpeed = 120;

		app.updatables.push((delta) => {
			controls.update(delta);

			// update terrain lod.
			app.terrain.geometry.update(controls.object.position.x - app.terrain.position.x, controls.object.position.z - app.terrain.position.z, 80);
		});
	});
	
	app.start();
});