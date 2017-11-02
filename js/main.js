"use strict";

window.addEventListener('load', () => {
	let app = new App();

	// Exempel på bruk av extension hjelpemetode.
	// app.extend(App.extension((app, image) => {
	// 	app.terrain = new Terrain({ image });
	// 	app.scene.add(app.terrain);
	// }, Utilities.loadImage('resources/heightmap.png')));
	
	// eksempel på 
	app.extend((app) => {
		let geometry = new THREE.BoxBufferGeometry(50, 50, 50);
		let material = new THREE.MeshBasicMaterial({ color: 0x000000 });
		let mesh = new THREE.Mesh(geometry, material);
		app.scene.add(mesh);

		app.updatables.push(() => {
			mesh.rotateY(0.001);
		});
	});
	
	app.extend(Utilities.loadImage('resources/heightmap.png').then((image) => {
		// return the callback function that will be called once the heightmap has been loaded.
		return (app) => {
			app.terrain = new Terrain({ image });
			app.scene.add(app.terrain);
			app.terrain.update({ x: 0, y: 0 });
		};
	}));

	app.start();
});