"use strict";

window.addEventListener('load', () => {
	let app = new App();

	// Exempel på bruk av extension hjelpemetode.
	// app.extend(App.extension((app, image) => {
	// 	app.terrain = new Terrain({ image });
	// 	app.scene.add(app.terrain);
	// }, Utilities.loadImage('resources/heightmap.png')));

	// setup terrain.
	app.extend(Utilities.loadImage('resources/textures/heightmap.png').then((image) => {
		// return the callback function that will be called once the heightmap has been loaded.
		return (app) => {
			let width = 3000;
			app.terrain = new Terrain({
				image,
				width,
				height: 450,
				levelsOfDetail: 5,
				numberOfSubdivisions: 16
			});

			app.terrain.position.x = -width/2;
			app.terrain.position.z = -width/2;
			app.scene.add(app.terrain);

			let light = new THREE.DirectionalLight( 0xffffff, 2);
			light.position.set(0.01, 1, 0);
			app.scene.add(light); // for testing purposes.
		};
	}));

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
			app.terrain.update(controls.object.position.x, controls.object.position.z, 80);
		});
	});
	
	app.start();
});