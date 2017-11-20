"use strict";

class Terrain extends THREE.Object3D {

	/**
	 * Constructs a Terrain node.
	 */
    constructor({ image, width = 100, levelsOfDetail = 2, numberOfSubdivisions = 16, height = 20 }) {
    	super();

    	this.levelsOfDetail = levelsOfDetail;
    	this.numberOfSubdivisions = numberOfSubdivisions;
        this.totalNumberOfSubdivisions = Math.pow(2, this.levelsOfDetail) * this.numberOfSubdivisions;

    	this.height = height;
    	this.width = width;

    	this.terrainQuadtree = new TerrainQuadtree({ x: 0, y: 0, width: this.width }, this.levelsOfDetail);

    	// initialize the terrain mesh:
    	this.init(image);

    	// cache to avoid doing updates when the camera is not moving.
    	this._cache = {
    		x: 0,
    		z: 0,
    		radius: 0
    	};
    }

    init(image) {

    	// get heightmap data
    	let heightmap = Utilities.getHeightmapData(image, this.totalNumberOfSubdivisions + 1);
    	let geometry = new THREE.PlaneBufferGeometry(this.width, this.width, this.totalNumberOfSubdivisions, this.totalNumberOfSubdivisions);

    	geometry.rotateX(-Math.PI / 2);

    	// assign Y-values
    	let v = 0;
    	for (let i = 0; i < heightmap.length; i++) {
    		geometry.attributes.position.array[v + 1] = heightmap[i] * this.height;
    		v += 3;
    	}

    	// center geometry around local origo.
    	geometry.translate(this.width / 2, 0, this.width / 2);

    	// recompute normals.
    	geometry.computeVertexNormals();

    	// set indexbuffer to dynamic.
    	geometry.index.setDynamic(true);

    	let grass = new THREE.TextureLoader().load('resources/textures/grass01.jpg');
    	grass.wrapS = THREE.RepeatWrapping;
		grass.wrapT = THREE.RepeatWrapping;
		grass.repeat.set(this.width/20, this.width/20);

    	let material = new THREE.MeshLambertMaterial({
			color: 0x777777,
			map: grass,
            //wireframe: true
		});

		this.mesh = new THREE.Mesh(geometry, material);

		this.add(this.mesh);
    }

    rebuild(nodes) {

    	let W = this.totalNumberOfSubdivisions + 1; // width in vertices.

    	let offset = 0; // offset in the index buffer where we want to write.

    	for (let i = 0; i < nodes.length; i++) {

    		let node = nodes[i];
            let neighbours = node.findNeighbours();

            // delta, true if the neighbouring node is on a different lod.
            let delta = [false, false, false, false];

            // get the level difference.
            delta[0] = (neighbours[0] !== null && neighbours[0].level < node.level); // bottom
            delta[1] = (neighbours[1] !== null && neighbours[1].level < node.level); // top
            delta[2] = (neighbours[2] !== null && neighbours[2].level < node.level); // left
            delta[3] = (neighbours[3] !== null && neighbours[3].level < node.level); // right
            

    		let factor = this.totalNumberOfSubdivisions / this.width;

    		let x = Math.round(node.x * factor);
    		let y = Math.round(node.y * factor);
    		let w = Math.round(node.width * factor) - 1;

    		let increment = Math.round(w / this.numberOfSubdivisions);

            // if all neighbours are on same level:
            if (delta[0] === false && delta[1] === false && delta[2] === false && delta[3] === false) {
                for (let j = y; j <= y + w; j += increment) {
                    for (let i = x; i <= x + w; i += increment) {
                        let a = (j * W) + i;
                        let b = (j * W) + (i + increment);
                        let c = ((j + increment) * W) + i;
                        let d = ((j + increment) * W) + (i + increment);

                        // add the vertices.
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = c;
                        this.mesh.geometry.index.array[offset + 2] = b;
                        this.mesh.geometry.index.array[offset + 3] = b;
                        this.mesh.geometry.index.array[offset + 4] = c;
                        this.mesh.geometry.index.array[offset + 5] = d;

                        offset += 6;
                    }
                }
            } else {
                // add indices for the non special cases. (middle)
                for (let j = y + increment; j <= (y + w) - increment; j += increment) {
                    for (let i = x + increment; i <= (x + w) - increment; i += increment) {
                        let a = (j * W) + i;
                        let b = (j * W) + (i + increment);
                        let c = ((j + increment) * W) + i;
                        let d = ((j + increment) * W) + (i + increment);

                        // add the vertices.
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = c;
                        this.mesh.geometry.index.array[offset + 2] = b;
                        this.mesh.geometry.index.array[offset + 3] = b;
                        this.mesh.geometry.index.array[offset + 4] = c;
                        this.mesh.geometry.index.array[offset + 5] = d;

                        offset += 6;
                    }
                }

                // to get the extreme of a coordinate.
                let maxed = (increment * (this.numberOfSubdivisions - 1));

                // bottom-strip
                for (let i = x, j = y; i <= x + w; i += increment + increment) {

                    let a = (j * W) + i;
                    let b = (j * W) + (i + increment);
                    let c = (j * W) + (i + increment + increment);
                    let d = ((j + increment) * W) + i;
                    let e = ((j + increment) * W) + (i + increment);
                    let f = ((j + increment) * W) + (i + increment + increment);

                    if (i !== x) {
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = d;
                        this.mesh.geometry.index.array[offset + 2] = e;
                        offset += 3;
                    }

                    if (delta[0]) {
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = e;
                        this.mesh.geometry.index.array[offset + 2] = c;
                        offset += 3;
                    } else {
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = e;
                        this.mesh.geometry.index.array[offset + 2] = b;
                        this.mesh.geometry.index.array[offset + 3] = b;
                        this.mesh.geometry.index.array[offset + 4] = e;
                        this.mesh.geometry.index.array[offset + 5] = c;
                        offset += 6;
                    }

                    if (i !== x + maxed - increment) {
                        this.mesh.geometry.index.array[offset + 0] = c;
                        this.mesh.geometry.index.array[offset + 1] = e;
                        this.mesh.geometry.index.array[offset + 2] = f;
                        offset += 3;
                    }
                }

                // top-strip
                for (let i = x, j = y + maxed; i <= x + w; i += increment + increment) {

                    let a = (j * W) + i;
                    let b = (j * W) + (i + increment);
                    let c = (j * W) + (i + increment + increment);
                    let d = ((j + increment) * W) + i;
                    let e = ((j + increment) * W) + (i + increment);
                    let f = ((j + increment) * W) + (i + increment + increment);

                    if (i !== x) {
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = d;
                        this.mesh.geometry.index.array[offset + 2] = b;
                        offset += 3;
                    }

                    if (delta[1]) {
                        this.mesh.geometry.index.array[offset + 0] = b;
                        this.mesh.geometry.index.array[offset + 1] = d;
                        this.mesh.geometry.index.array[offset + 2] = f;
                        offset += 3;
                    } else {
                        this.mesh.geometry.index.array[offset + 0] = b;
                        this.mesh.geometry.index.array[offset + 1] = d;
                        this.mesh.geometry.index.array[offset + 2] = e;
                        this.mesh.geometry.index.array[offset + 3] = b;
                        this.mesh.geometry.index.array[offset + 4] = e;
                        this.mesh.geometry.index.array[offset + 5] = f;
                        offset += 6;
                    }

                    if (i !== x + maxed - increment) {
                        this.mesh.geometry.index.array[offset + 0] = c;
                        this.mesh.geometry.index.array[offset + 1] = b;
                        this.mesh.geometry.index.array[offset + 2] = f;
                        offset += 3;
                    }
                }

                // left-strip
                for (let j = y, i = x; j <= y + w; j += increment + increment) {

                    let a = (j * W) + i;
                    let b = (j * W) + (i + increment);

                    let c = ((j + increment) * W) + i;
                    let d = ((j + increment) * W) + (i + increment);

                    let e = ((j + increment + increment) * W) + i;
                    let f = ((j + increment + increment) * W) + (i + increment);

                    if (j !== y) {
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = d;
                        this.mesh.geometry.index.array[offset + 2] = b;
                        offset += 3;
                    }

                    if (delta[2]) {
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = e;
                        this.mesh.geometry.index.array[offset + 2] = d;
                        offset += 3;
                    } else {
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = c;
                        this.mesh.geometry.index.array[offset + 2] = d;
                        this.mesh.geometry.index.array[offset + 3] = c;
                        this.mesh.geometry.index.array[offset + 4] = e;
                        this.mesh.geometry.index.array[offset + 5] = d;
                        offset += 6;
                    }

                    if (i !== x + maxed - increment) {
                        this.mesh.geometry.index.array[offset + 0] = d;
                        this.mesh.geometry.index.array[offset + 1] = e;
                        this.mesh.geometry.index.array[offset + 2] = f;
                        offset += 3;
                    }
                }

                // right-strip
                for (let j = y, i = x + maxed; j <= y + w; j += increment + increment) {

                    let a = (j * W) + i;
                    let b = (j * W) + (i + increment);

                    let c = ((j + increment) * W) + i;
                    let d = ((j + increment) * W) + (i + increment);

                    let e = ((j + increment + increment) * W) + i;
                    let f = ((j + increment + increment) * W) + (i + increment);

                    if (j !== y) {
                        this.mesh.geometry.index.array[offset + 0] = a;
                        this.mesh.geometry.index.array[offset + 1] = c;
                        this.mesh.geometry.index.array[offset + 2] = b;
                        offset += 3;
                    }

                    if (delta[3]) {
                        this.mesh.geometry.index.array[offset + 0] = b;
                        this.mesh.geometry.index.array[offset + 1] = c;
                        this.mesh.geometry.index.array[offset + 2] = f;
                        offset += 3;
                    } else {
                        this.mesh.geometry.index.array[offset + 0] = b;
                        this.mesh.geometry.index.array[offset + 1] = c;
                        this.mesh.geometry.index.array[offset + 2] = d;
                        this.mesh.geometry.index.array[offset + 3] = c;
                        this.mesh.geometry.index.array[offset + 4] = f;
                        this.mesh.geometry.index.array[offset + 5] = d;
                        offset += 6;
                    }

                    if (i !== x + maxed - increment) {
                        this.mesh.geometry.index.array[offset + 0] = c;
                        this.mesh.geometry.index.array[offset + 1] = e;
                        this.mesh.geometry.index.array[offset + 2] = f;
                        offset += 3;
                    }
                }

            }
    	}

    	this.mesh.geometry.setDrawRange(0, offset); // draw only the defined vertices.
    	this.mesh.geometry.index.updateRange.count = offset; // avoid uploading unneccessary data to the GPU.
		this.mesh.geometry.index.needsUpdate = true; // make sure the indices are uploaded.
    }

    /**
     * Update terrain, with LOD based on given position.
     * @param  {{x, y}} position
     */
    update(x, z, radius = 25) {
    	if (x === this._cache.x && z === this._cache.z && radius === this._cache.radius) {
    		return;
    	}
    	
    	this.terrainQuadtree.update({ x: x - this.position.x, y: z - this.position.z, radius });
    	let nodes = this.terrainQuadtree.tree.getLeafNodes();

    	this.rebuild(nodes);

    	this._cache.x = x;
    	this._cache.z = z;
    	this._cache.radius = radius;
    }
}