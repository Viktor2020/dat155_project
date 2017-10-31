"use strict";

// TODO: integrate better with THREEJS, it's kinda adhoc right now.

class Terrain {

    constructor() {
    	let width = 1000;
    	let height = 1000;

    	this.object = new THREE.Object3D();

    	this.numberOfLevels = 3;
    	this.tree = new Quadtree({
    		x: 0,
    		y: 0,
    		width: 1000,
    		height: 1000
    	}, this.numberOfLevels);

    	this.data = []; // array of heightmaps, subscript indicating the level of detail.
    	// Length should be equal to numberOfLevels.

    	// build geometry
    	this.buildGeometry(this.tree);
    }

    buildGeometry(quadtree, level = 0) {
    	let lod = this.numberOfLevels - level;

    	quadtree.nodes.forEach((node) => {

    		let geometry = new THREE.PlaneBufferGeometry(node.width, node.height, 32);
    		
    		let vertices = geometry.attributes.position.array;

    		// TODO: Here we somehow need to correctly get the height from the heightmap, given the bounds of the node.
			for (let i = 0, j = 0; i < vertices.length; i++, j += 3) {
				vertices[j + 1] = data[lod][i] * 10;
			}

			let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    		node.mesh = new THREE.Mesh(geometry, material);

    		// position mesh according to 
    		node.mesh.position.x = node.x;
    		node.mesh.position.y = node.y;

    		// should be this.add ;)
    		this.object.add(node.mesh);
    	});
    }

    update(position) {
    	let nodes = tree.get(position.x, position.y);

    	for every node in tree:
    		set visibility to false
    		if in nodes: set visibility to true
    }
}

/**
 * Quadtree
 */
class Quadtree {
	constructor(bounds, numberOfLevels = 3) {
		this.bounds = bounds;
		this.isLeaf = false;

		if (numberOfLevels > 0) {
			this.nodes = this.split(numberOfLevels);
		} else {
			this.isLeaf = true;
		}
	}

	split(numberOfLevels) {
		let width = this.bounds.width / 2;
		let height = this.bounds.height / 2;
		let x = this.bounds.x;
		let y = this.bounds.y;

		// bottom left
		let q1 = new Quadtree({
			x: x,
			y: y,
			width,
			height,
		}, numberOfLevels - 1);

		// bottom right
		let q2 = new Quadtree({
			x: x + width,
			y: y,
			width,
			height,
		}, numberOfLevels - 1);

		// top left
		let q3 = new Quadtree({
			x: x,
			y: y + height,
			width,
			height,
		}, numberOfLevels - 1);

		// top right
		let q4 = new Quadtree({
			x: x + width,
			y: y + height,
			width,
			height,
		}, numberOfLevels - 1);

		return [q1, q2, q3, q4];
	}

	/**
	 * Checks if point is within node.
	 * @param  {Number} x
	 * @param  {Number} y
	 * @return {Boolean} True if intersecting.
	 */
	intersects(x, y) {
		// to shorten it. (may be faster using it directly)
		let b = {
			x: this.bounds.x,
			y: this.bounds.y,
			xw: this.bounds.x + this.bounds.width,
			yh: this.bounds.y + this.bounds.height
		};

		return ((b.x <= x && x <= b.xw) && (b.y <= y && y <= b.yh));
	}

	/**
	 * Gets the least amount of nodes to accurately depict the terrain at the give position.
	 * @return {Array} Array of Quadtree-nodes.
	 */
	get(x, y) {
		if (this.isLeaf) {
			return [ this ];
		} else {
			return this.nodes.reduce((arr, node) => {
				if (node.intersects(x, y)) {
					let sub = node.get(x, y); // point is within node, go one level deeper.
					return arr.concat(sub); // push each returned node.
				} else {
					return arr.concat([node]); // point is not within node, return top level.
				}
			}, []);
		}
	}
}