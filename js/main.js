"use strict";

window.addEventListener('load', () => {
	let app = new App();

	app.extend((app) => {
		// lighting.
		let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
		directionalLight.position.set(0.01, 1, 0);
		app.scene.add(directionalLight); // for testing purposes.

		let ambientLight = new THREE.AmbientLight(0x404040);
		app.scene.add(ambientLight);
	});

	// setup terrain.
	let resources = Promise.all([
		Utilities.loadImage('resources/textures/heightmap.png'),
		new THREE.TextureLoader().load('resources/textures/grass_01.jpg'),
		new THREE.TextureLoader().load('resources/textures/snowy_rock_01.png'),
		new THREE.TextureLoader().load('resources/textures/splatmap_01.png')
	]);

	app.extend(resources.then((resources) => {
		// return the callback function that will be called once the heightmap has been loaded.
		return (app) => {
			let width = 3000;

			let geometry = new TerrainBufferGeometry({
				heightmapImage: resources[0],
				width,
				height: 450,
				levelsOfDetail: 5,
				numberOfSubdivisions: 16
			});

			let grass = resources[1];
	    	grass.wrapS = THREE.RepeatWrapping;
			grass.wrapT = THREE.RepeatWrapping;
			grass.repeat.set(width/40, width/40);

			let snowyRock = resources[2];
	        snowyRock.wrapS = THREE.RepeatWrapping;
	        snowyRock.wrapT = THREE.RepeatWrapping;
	        snowyRock.repeat.set(width/80, width/80);

        	let splatMap1 = resources[3];

	        let material = new TextureSplattingMaterial({
	            color: 0x777777,
	            shininess: 0,
	            textures: [snowyRock, grass],
	            splatMaps: [splatMap1]
	        });

			app.terrain = new THREE.Mesh(geometry, material);

			//app.terrain.position.x = -width/2;
			//app.terrain.position.z = -width/2;
			
			app.terrain.position.x = 500;
			app.terrain.position.z = 500;

			app.scene.add(app.terrain);
		};
	}));

    //Load a list of objects!
    //{ geometryUrl: "object-url", materialUrl: "material-url"}
    app.extend(Promise.all([// I'll load them later
        {
            geometryUrl: "resources/models/lowpolytree2/lowpolytree2.obj",
            materialUrl: "resources/models/lowpolytree2/lowpolytree2.mtl",
            parameters: {
                upperPlacementBound: 300, // Tree line, upper
                lowerPlacementBound: 100, //Tree line lower
                minScale: 0.5,
                maxScale: 1.5,
                size: 1,// size*scale = minimum distance to next object
                verticalDisplacement: 0, // vd*scale used to move the object down in to the ground.
                numberOfObjects: 100,
				type:0//type = tree
            }
        },
        {
            geometryUrl: "resources/models/awesomeTree/awesomeTree.obj",
            materialUrl: "resources/models/awesomeTree/awesomeTree.mtl",
            parameters: {
                upperPlacementBound: 300, // Tree line, upper
                lowerPlacementBound: 60, //Tree line lower
                minScale: 0.3,
                maxScale: 0.6,
                size: 1,// size*scale = minimum distance to next object
                verticalDisplacement: 0, // vd*scale used to move the object down in to the ground.
                numberOfObjects: 5,
                type:0//type = tree
            }
        },
        {
            geometryUrl: "resources/models/rock1/rock1.obj",
            materialUrl: "resources/models/rock1/rock1.mtl",
            parameters: {
                upperPlacementBound: 1000,
                lowerPlacementBound: 0,
                minScale: 0.3,
                maxScale: 3,
                size: 1,// size*scale = minimum distance to next object
                verticalDisplacement: 0, // vd*scale used to move the object down in to the ground.
                numberOfObjects: 100,
				type:1//type = tree
            }
        },
        {
            geometryUrl: "resources/models/rock3/rock3.obj",
            materialUrl: "resources/models/rock3/rock3.mtl",
            parameters: {
                upperPlacementBound: 1000,
                lowerPlacementBound: 0,
                minScale: 0.3,
                maxScale: 3,
                size: 1,// size*scale = minimum distance to next object
                verticalDisplacement: 0, // vd*scale used to move the object down in to the ground.
                numberOfObjects: 5,
                type:1//type = tree
            }
        }
    ].map((source) => {
        return Utilities.OBJLoader(source.geometryUrl, Utilities.MTLLoader(source.materialUrl)).then((object) => {

            return Promise.resolve({
                obj: object,
                parameters: source.parameters
			});
        });
    })).then((objects) => { //When promises has resolved (models loaded)

        return (app) => {
            //Parse that list to decorations class
            let decorations = new TerrainElements(objects,app);
            for(let i = 0; i < decorations.nodelist.length;i++) {
                app.scene.add(decorations.nodelist[i]);
            }
            //app.scene.add(decorations);

            // maybe do something else..
        }
    }));//Load object done

	// setup camera.
	app.extend((app) => {
		let controls = new CameraControls(app.camera, app.renderer.domElement,250,0.02);
		app.scene.add(controls.object);
		controls.object.position.z = 0;
		controls.object.position.y = 350;

//controls.movementSpeed = 250;

		let geometry = new THREE.CubeGeometry( 3500, 3500,3500);

		let cubeMaterials =
				[
						new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader( ).load( "resources/img/skybox/desertsky_ft.png" ), side: THREE.DoubleSide}),
						new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader( ).load( "resources/img/skybox/desertsky_bk.png" ), side: THREE.DoubleSide}),
						new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader( ).load( "resources/img/skybox/desertsky_up.png" ), side: THREE.DoubleSide}),
						new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader( ).load( "resources/img/skybox/desertsky_dn.png" ), side: THREE.DoubleSide}),
						new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader( ).load( "resources/img/skybox/desertsky_rt.png" ), side: THREE.DoubleSide}),
						new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader( ).load( "resources/img/skybox/desertsky_lf.png" ), side: THREE.DoubleSide})
				];

		let cubeMap = new THREE.CubeTextureLoader().setPath("resources/img/skybox/").load([
				"desertsky_ft.png",
				"desertsky_bk.png",
				"desertsky_up.png",
				"desertsky_dn.png",
				"desertsky_rt.png",
				"desertsky_lf.png"
		]);

		let pm = new THREE.MeshBasicMaterial({color:0xff0000});
		let pg = new THREE.CubeGeometry(20,20,20,20);
		let player = new THREE.Mesh(pg,pm);

		let cube = new THREE.Mesh( geometry, cubeMaterials );
		app.scene.add(cube);
		app.scene.add(player);

		app.updatables.push((delta) => {
			controls.update(delta);

			//app.terrain.update(controls.object.position.x, controls.object.position.z, 80);
			cube.position.copy(controls.object.position);
			player.position.copy(controls.object.position);

			// update terrain lod.
			let position = app.terrain.worldToLocal(controls.object.position.clone());

			app.terrain.geometry.update(position.x, position.z, 80);
		});
	});
	//add water with dynamic envMapping
	app.extend((app) => {

        //let cubeMaterial = THREE.MeshFaceMaterial(cubeMaterials);
        //cubeMap.mapping = THREE.CubeRefractionMapping;
		let cubecam = new THREE.CubeCamera(app.zNear,app.zFar,512);
		cubecam.renderTarget.mapping = THREE.CubeRefractionMapping;
        let w = new Water(100,100,cubecam.renderTarget);
        w.object.position.set(780,282,-600);
        cubecam.position.copy(w.object.position);
        cubecam.position.y += 0;
        cubecam.position.z += 23;//move cam to the center of the visible part of the water.


        let pm = new THREE.MeshBasicMaterial({color:0xff0000});
        let pg = new THREE.CubeGeometry(2,20,2,2);
        let player = new THREE.Mesh(pg,pm);

		player.position.copy(cubecam.position);
        app.scene.add(w.object);
        app.scene.add(player);

		app.updatables.push((delta) => {
            w.normalMap.offset.x += 0.01 * delta;
            w.normalMap.offset.y += 0.01 * delta;
            cubecam.update(app.renderer,app.scene);
        });
	});

    app.extend((app) => {
        //Inner skydome is used to get a mre natural fog effect while still makeing the skydome visible thru the fog
    let geometry = new THREE.SphereGeometry(2000, 60, 60);
    let material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, opacity: 0.7,transparent:true, fog: true});

    this.innerSkyDome = new THREE.Mesh(geometry, material);
    this.innerSkyDome.scale.set(-1, 1, 1);
    this.innerSkyDome.eulerOrder = 'XZY';
    this.innerSkyDome.renderDepth = 1000.0;
    app.scene.add(this.innerSkyDome);

    //The outer dome makes the inner skydome more visible and makes the terrain visible behind the inner skydome
    let geometry1 = new THREE.SphereGeometry(3500, 60, 60);
    let material1 = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('resources/img/skybox/panorama1.jpg'), side: THREE.DoubleSide, opacity: 1,transparent:false, fog: false});

    this.outerSkyDome = new THREE.Mesh(geometry1, material1);
    this.outerSkyDome.scale.set(-1, 1, 1);
    this.outerSkyDome.eulerOrder = 'XZY';
    this.outerSkyDome.renderDepth = 1000.0;
    app.scene.add(this.outerSkyDome);
    });


    //add a circling plane
    app.extend((app) => {

        let materialLoader = new THREE.MTLLoader();

        materialLoader.load('resources/models/Plane/plane222.mtl', function(mat) {
            mat.preload();
            let objectLoader = new THREE.OBJLoader();

            objectLoader.setMaterials(mat);
            objectLoader.load('resources/models/Plane/plane222.obj', function (obj) {

                obj.scale.set(0.8, 0.8, 0.8);

                let plane = new Plane(obj,15);


                app.updatables.push((delta) => {
                    plane.update(delta);
                });

                app.scene.add(obj);
            });
        });
    });
		
	app.start();
});
