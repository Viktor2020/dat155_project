"use strict";

class Terrain extends THREE.Object3D {

	/**
	 * Loads heightmap data from an image.
	 * The image must be completely loaded before using this method.
	 * @param  {Image} image Image to load.
	 * @return {Array} A Uint8Array containing the heightmap data.
	 */
	static getHeightmap(image, size) {
		let canvas = document.createElement('canvas');
		
		// assume texture is a square
	    canvas.width = size;
	    canvas.height = size;

	    let context = canvas.getContext('2d');
	    context.imageSmoothingEnabled = true;
	    context.imageSmoothingQuality = "high";

	    let heightData = new Uint8Array(size * size);

    	context.drawImage(image, 0, 0, size, size);

    	let imageData = context.getImageData(0, 0, size, size).data;

	    imageData.forEach((a, i) => {
	    	if (i % 4 === 0) { // only extract the first component of (r,g,b,a).
	    		heightData[Math.floor(i / 4)] = a;
	    	}
	    });


	    return heightData;
	}

	/**
	 * Constructs a Terrain node.
	 */
    constructor({ image, size = 100, levelsOfDetail = 2, subdivisions = 16, height = 20 }) {
    	super();

    	this.levelsOfDetail = levelsOfDetail;
    	this.subdivisions = subdivisions;
    	this.height = height;
    	this.size = size;
    	this.heightmapImage = image;

    	this.tree = new Quadtree({
    		x: 0,
    		z: 0,
    		size,
    	}, levelsOfDetail);

    	// get heightmap data
    	this.heightmapSize = (Math.pow(2, levelsOfDetail) * subdivisions) + 1;
    	this.heightmap = this.constructor.getHeightmap(image, this.heightmapSize);

    	// build the terrain geometry from heightmap.
		this.buildGeometry(this.tree);
    }

    buildGeometry(node, level = 0) {

    	// defines the area of the heightmap we want to extract data from.
    	let factor = (this.heightmapSize - 1) / this.size;
		let textureBounds = {
			x: Math.round(factor * node.bounds.x),
			y: Math.round(factor * node.bounds.z),
			size: Math.round(factor * node.bounds.size) + 1
		};

		let step = textureBounds.size / this.subdivisions;

		// when creating a plane with 16 subdivisions it will have 17^2 vertices.
		let geometry = new THREE.PlaneBufferGeometry(node.bounds.size, node.bounds.size, this.subdivisions, this.subdivisions);

		//console.log(geometry);

	   	geometry.rotateX(-Math.PI / 2);

		let vertices = geometry.attributes.position.array;
		let uvs = geometry.attributes.uv.array;

		let i = 0;
		let f = 0;
		for (let y = textureBounds.y; y < (textureBounds.y + textureBounds.size); y += step) {
			for (let x = textureBounds.x; x < (textureBounds.x + textureBounds.size); x += step) {
				// set the Y-component to the corresponding height value.
				x = Math.round(x);
				y = Math.round(y);
				vertices[i + 1] = (this.heightmap[y * this.heightmapSize + x] / 255) * this.height;
				i += 3;

				uvs[f] = (x / this.heightmapSize);
				uvs[f + 1] = 1 - (y / this.heightmapSize);

				f += 2;
			}
		}

		// move origo to corner (instead of centre).
		geometry.translate((node.bounds.size / 2), 0, (node.bounds.size / 2));



		let material = new THREE.MeshBasicMaterial( {
			color: 0x555555,
			map: new THREE.TextureLoader().load('resources/heightmap.png'),
			wireframe: true
		});

		node.mesh = new THREE.Mesh(geometry, material);

		// position mesh according to quadtree.
		node.mesh.position.x = node.bounds.x;
		node.mesh.position.z = node.bounds.z;

		node.mesh.visible = false;

		this.add(node.mesh);

		// // do the same for all the children.
		if (node.isLeaf === false) {
	    	node.children.forEach((child) => {
	    		this.buildGeometry(child, level + 1);
	    	});
		}
    }

    /**
     * Update terrain, with LOD based on given position.
     * @param  {{x, y}} position
     */
    update(position, size = 25) {

    	// clear visibility
    	this.children.forEach((child) => {
    		child.visible = false;
    	});

    	let nodes = this.tree.get({
    		x: (position.x - (size / 2)) - this.position.x, // to account for the terrain node being moved.
    		z: (position.z - (size / 2)) - this.position.z,
    		size
    	});

    	nodes.forEach((node) => {
    		if (node.mesh) {
    			node.mesh.visible = true;
    		}
    	});
    }
}


/**
 * Quadtree for LOD.
 */

class Quadtree {
	constructor(bounds, numberOfLevels = 3) {
		this.bounds = bounds;
		this.isLeaf = false;

		if (numberOfLevels > 0) {
			this.children = this.split(numberOfLevels); // recursively split quadtree.
		} else {
			this.isLeaf = true;
		}
	}

	split(numberOfLevels) {
		let size = this.bounds.size / 2;
		let x = this.bounds.x;
		let z = this.bounds.z;

		// bottom left
		let q1 = new Quadtree({
			x: x,
			z: z,
			size
		}, numberOfLevels - 1);

		// bottom right
		let q2 = new Quadtree({
			x: x + size,
			z: z,
			size
		}, numberOfLevels - 1);

		// top left
		let q3 = new Quadtree({
			x: x,
			z: z + size,
			size
		}, numberOfLevels - 1);

		// top right
		let q4 = new Quadtree({
			x: x + size,
			z: z + size,
			size
		}, numberOfLevels - 1);

		return [q1, q2, q3, q4];
	}
	
	/**
	 * Checks if the square intersects the node.
	 * @param  {Object} square Object defining the square { x, y, size }
	 * @return {Boolean}
	 */
	intersects(square) {
		// to shorten it. (may be faster using it directly)
		let nodeSquare = {
			x: this.bounds.x,
			z: this.bounds.z,
			size: this.bounds.size,
		};

		return (square.x < nodeSquare.x + nodeSquare.size &&
			square.x + square.size > nodeSquare.x &&
			square.z < nodeSquare.z + nodeSquare.size &&
			square.z + square.size > nodeSquare.z);
	}

	/**
	 * Gets the least amount of nodes covering the entire area with the given intersection.
	 * @param  {{x, y, size}} square Defines the area of intersection.
	 * @return {Array} An array of Quadtree-nodes.
	 */
	get(square) {
		if (this.isLeaf === false && this.intersects(square)) { // we need to go deeper.
			return this.children.reduce((arr, child) => {
				return arr.concat(child.get(square));
			}, []);
		} else {
			return [ this ]; // base case.
		}
	}
}