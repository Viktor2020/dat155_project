"use strict";

window.addEventListener('load', () => {
	let app = new App();

	// Exempel på bruk av extension hjelpemetode.
	// app.extend(App.extension((app, image) => {
	// 	app.terrain = new Terrain({ image });
	// 	app.scene.add(app.terrain);
	// }, Utilities.loadImage('resources/heightmap.png')));

	// setup terrain.
	app.extend(Utilities.loadImage('resources/heightmap.jpg').then((image) => {
		// return the callback function that will be called once the heightmap has been loaded.
		return (app) => {
			let size = 1000;
			app.terrain = new Terrain({
				image,
				size: size,
				levelsOfDetail: 4,
				subdivisions: 16,
				height: 200
			});

			app.terrain.position.x = -size/2;
			app.terrain.position.z = -size/2;
			app.scene.add(app.terrain);
		};
	}));

	// setup camera.
	app.extend((app) => {
		let controls = new CameraControls(app.camera, app.renderer.domElement);
		app.scene.add(controls.object);
		controls.object.position.z = 15;
		controls.object.position.y = 150;

		app.updatables.push((delta) => {
			controls.update(delta);

			// update terrain lod.
			app.terrain.update(controls.object.position, 100); // where 20, is the bounding square for lod.
		});
	});

	// add a simple rotating cube, just for testing.
	app.extend((app) => {
		let geometry = new THREE.BoxBufferGeometry(5, 5, 5);
		let material = new THREE.MeshBasicMaterial({ color: 0x333333 });
		let mesh = new THREE.Mesh(geometry, material);
		app.scene.add(mesh);

		// add animation.
		app.updatables.push((delta) => {
			mesh.rotateY(0.1 * delta);
		});
	});
	
	

	app.start();
});