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

    //Load a list of objects!
    //{ geometryUrl: "object-url", materialUrl: "material-url"},
    app.extend(Promise.all([// I'll load them later
        {
            geometryUrl: "resources/3Dmodels/lowpolytree/lowpolytree.obj",
            materialUrl: "resources/3Dmodels/lowpolytree/lowpolytree.mtl",
            parameters: {
                upperPlacementBound: 300, // Tree line, upper
                lowerPlacementBound: 60, //Tree line lower
                minScale: 10,
                maxScale: 70,
                size: 1,// size*scale = minimum distance to next object
                verticalDisplacement: 0 // vd*scale used to move the object down in to the ground.
            }
        },
        {
            geometryUrl: "resources/3Dmodels/rock1/rock1.obj",
            materialUrl: "resources/3Dmodels/rock1/rock1.mtl",
            parameters: {
                upperPlacementBound: 1000,
                lowerPlacementBound: 0,
                minScale: 10,
                maxScale: 70,
                size: 1,// size*scale = minimum distance to next object
                verticalDisplacement: 0 // vd*scale used to move the object down in to the ground.
            }
        }
    ].map((source) => {
        return Utilities.OBJLoader(source.geometryUrl, Utilities.MTLLoader(source.materialUrl)).then((object) => {
            return {
                object,
                parameters: source.parameters
            };
        });
    })).then((objects) => { //When promises has resolved (models loaded)

        return (app) => {
            //Parse that list to decorations class
            let decorations = new Decorations(objects);
            app.scene.add(decorations);

            // maybe do something else..
        }
    }));//Load object done

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