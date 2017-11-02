"use strict";

class Terrain extends THREE.Object3D {

	/**
	 * Loads heightmap data from an image.
	 * The image must be completely loaded before using this method.
	 * @param  {Image} image Image to load.
	 * @return {Array} An array of Uint8Arrays containing the heightmap data at different levels of detail.
	 */
	static getHeightmap(image, subdivisions, levelsOfDetail) {
		let canvas = document.createElement('canvas');
		let targetSize = Math.pow(2, levelsOfDetail) * subdivisions;
		
	    canvas.width = targetSize;
	    canvas.height = targetSize;

	    let context = canvas.getContext('2d');

	    let data = [];

	    for (let i = 0; i <= levelsOfDetail; i++) {

	    	let size = Math.pow(2, i) * subdivisions;

	    	let heightData = new Uint8Array(size * size);

	    	context.drawImage(image, 0, 0, size, size);

	    	let imageData = context.getImageData(0, 0, size, size).data;

		    imageData.forEach((a, i) => {
		    	if (i % 4 === 0) { // only extract the first component of (r,g,b,a).
		    		heightData[Math.floor(i / 4)] = a;
		    	}
		    });

		    data.push(heightData);
	    }

	    return data;
	}

	/**
	 * Constructs a Terrain node.
	 */
    constructor({ image, size = 1000, levelsOfDetail = 3, subdivisions = 16, height = 50 }) {
    	super();

    	this.levelsOfDetail = levelsOfDetail;
    	this.subdivisions = subdivisions;
    	this.height = height;
    	this.size = size;

    	this.tree = new Quadtree({
    		x: 0,
    		y: 0,
    		size,
    	}, levelsOfDetail);

    	// build geometry
    	this.heightmap = this.constructor.getHeightmap(image, subdivisions, levelsOfDetail);

    	// when the heightmap has loaded, build the terrain geometry from it.
		this.buildGeometry(this.tree);
    }

    buildGeometry(node, level = 0) {
    	let geometry = new THREE.PlaneBufferGeometry(node.bounds.size, node.bounds.size, this.subdivisions);
    	geometry.rotateX(-Math.PI / 2);

		let vertices = geometry.attributes.position.array;

		let heightmap = this.heightmap[level];

		let textureSize = Math.round(Math.sqrt(heightmap.length));

		let textureBounds = {
			x: (node.bounds.x / this.size) * textureSize,
			y: (node.bounds.y / this.size) * textureSize,
			size: (node.bounds.size / this.size) * textureSize
		};

		let i = 0;
		for (let y = textureBounds.y; y < (textureBounds.y + textureBounds.size); y++) {
			for (let x = textureBounds.x; x < (textureBounds.x + textureBounds.size); x++) {
				// set the Y-component to the corresponding height value.
				vertices[i + 1] = (heightmap[y * textureSize + x] / 255) * this.height;
				i += 3;
			}
		}
		
		let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		node.mesh = new THREE.Mesh(geometry, material);

		// position mesh according to quadtree.
		node.mesh.position.x = node.bounds.x;
		node.mesh.position.y = node.bounds.y;

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
    update(position, size = 50) {

    	// clear visibility
    	this.children.forEach((child) => {
    		child.visible = false;
    	});

    	// a square centered around the position.
    	let lodSquare = {
    		x: position.x - (size / 2),
    		y: position.y - (size / 2),
    		size
    	};

    	let nodes = this.tree.get(lodSquare);
    	console.log(nodes);
    	nodes.forEach((node) => {
    		node.mesh.visible = true;
    		console.log(node);
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
		let y = this.bounds.y;

		// bottom left
		let q1 = new Quadtree({
			x: x,
			y: y,
			size
		}, numberOfLevels - 1);

		// bottom right
		let q2 = new Quadtree({
			x: x + size,
			y: y,
			size
		}, numberOfLevels - 1);

		// top left
		let q3 = new Quadtree({
			x: x,
			y: y + size,
			size
		}, numberOfLevels - 1);

		// top right
		let q4 = new Quadtree({
			x: x + size,
			y: y + size,
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
			y: this.bounds.y,
			size: this.bounds.size,
		};

		return (square.x < nodeSquare.x + nodeSquare.size &&
			square.x + square.size > nodeSquare.x &&
			square.y < nodeSquare.y + nodeSquare.size &&
			square.y + square.size > nodeSquare.y);
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