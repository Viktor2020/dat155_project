"use strict";

class Terrain extends THREE.Object3D {

	static getHeightData(image) {

	    let canvas = document.createElement('canvas');
	    canvas.width = image.width;
	    canvas.height = image.height;

	    let context = canvas.getContext('2d');

	    let size = image.width * image.height;
	    let data = new Float32Array(size);

	    context.drawImage(image, 0, 0);

	    var imgd = context.getImageData(0, 0, image.width, image.height);
	    var pix = imgd.data;

	    console.log(pix);

	    for (let i = 0; i < size * 4; i += 4) {
	    	data[i % 4] = pix[i];
	    }

	    return data;
	}

    constructor({ data, size = 1000, levelsOfDetail = 3, nodePolyCount = 32, height = 200 }) {
    	super();

    	this.data = []; // heightmap data.
    	this.levelsOfDetail = levelsOfDetail;
    	this.nodePolyCount = nodePolyCount; // polycount per node, in the quadtree. (at level 3, (4^3)*32 = 2048)
    	this.height = height;

    	this.tree = new Quadtree({
    		x: 0,
    		y: 0,
    		width: size,
    		height: size
    	}, levelsOfDetail);

    	// build geometry
    	this.buildGeometry(this.tree);
    }

    buildGeometry(quadtree) {
    	quadtree.nodes.forEach((node) => {

    		let geometry = new THREE.PlaneBufferGeometry(node.width, node.height, this.nodePolyCount);
    		let vertices = geometry.attributes.position.array;

    		// TODO: Here we somehow need to correctly get the height from the heightmap, given the bounds of the node.
			for (let i = 0, j = 0; i < vertices.length; i++, j += 3) {
				vertices[j + 1] = data[i] * this.height;
			}


			let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    		node.mesh = new THREE.Mesh(geometry, material);

    		// position mesh according to quadtree.
    		node.mesh.position.x = node.x;
    		node.mesh.position.y = node.y;

    		node.mesh.visible = false;

    		this.add(node.mesh);

    		this.buildGeometry(node); // do the same for all the children.
    	});
    }

    update(position) {

    	// clear visibility
    	this.children.forEach((child) => {
    		child.visible = false;
    	});

    	let nodes = tree.get(position.x, position.y);

    	nodes.forEach((node) => {
    		node.visible = true;
    	})
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