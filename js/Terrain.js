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
	    context.imageSmoothingEnabled = true;
	    context.imageSmoothingQuality = "high";

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
    constructor({ image, size = 100, levelsOfDetail = 2, subdivisions = 16, height = 20 }) {
    	super();

    	this.levelsOfDetail = levelsOfDetail;
    	this.subdivisions = subdivisions;
    	this.height = height;
    	this.size = size;

    	this.tree = new Quadtree({
    		x: 0,
    		z: 0,
    		size,
    	}, levelsOfDetail);

    	// build geometry
    	this.heightmap = this.constructor.getHeightmap(image, subdivisions, levelsOfDetail);

    	// build the terrain geometry from heightmap.
		this.buildGeometry(this.tree);
    }

    buildGeometry(node, level = 0) {

		let heightmap = this.heightmap[level];

		let textureSize = Math.round(Math.sqrt(heightmap.length));

		let textureBounds = {
			x: (node.bounds.x / this.size) * textureSize,
			y: (node.bounds.z / this.size) * textureSize,
			size: (node.bounds.size / this.size) * textureSize
		};

		let edgeOffsetX = 0;
		let edgeOffsetZ = 0;

		if (node.bounds.x + node.bounds.size === this.size) {
			edgeOffsetX = 1; // this is a edge node.
		}

		if (node.bounds.z + node.bounds.size === this.size) {
			edgeOffsetZ = 1;
		}

		let geometry = new THREE.PlaneBufferGeometry(node.bounds.size, node.bounds.size, this.subdivisions - edgeOffsetX, this.subdivisions - edgeOffsetZ);

    	geometry.rotateX(-Math.PI / 2);

		let vertices = geometry.attributes.position.array;

		let i = 0;

		for (let y = textureBounds.y; y < (textureBounds.y + textureBounds.size) + 1 - edgeOffsetZ; y++) {
			for (let x = textureBounds.x; x < (textureBounds.x + textureBounds.size) + 1 - edgeOffsetX; x++) {
				// set the Y-component to the corresponding height value.
				vertices[i + 1] = (heightmap[y * textureSize + x] / 255) * this.height;
				i += 3;
			}
		}

		let material = new THREE.MeshBasicMaterial( {
			color: 0x666666,
			wireframe: true
		});

		geometry.translate((node.bounds.size / 2), 0, (node.bounds.size / 2));

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
    		node.mesh.visible = true;
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