"use strict";

window.addEventListener('load', () => {
	let app = new App();

	// Exempel på bruk av extension hjelpemetode.
	// app.extend(App.extension((app, image) => {
	// 	app.terrain = new Terrain({ image });
	// 	app.scene.add(app.terrain);
	// }, Utilities.loadImage('resources/heightmap.png')));
	
	// add a simple rotating cube, just to make sure we can see something.
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

	app.extend(Utilities.loadImage('resources/heightmap.png').then((image) => {
		// return the callback function that will be called once the heightmap has been loaded.
		return (app) => {
			app.terrain = new Terrain({ image });
			app.scene.add(app.terrain);
			//app.terrain.update({ x: 0, y: 0 });
		};
	}));

	// setup camera.
	app.extend((app) => {
		let controls = new CameraControls(app.camera, app.renderer.domElement);
		app.scene.add(controls.object);
		controls.object.position.z = 15;

		app.updatables.push((delta) => {
			controls.update(delta);
		});
	});
	
	

	app.start();
});