"use strict";

class TerrainElements {
    //TODO Cleanup
    constructor(objects,app) {
        this.elements = [];
        this.nodelist = [];
        this.app = app;

        this.initTerrainElements(objects);

    }

    placeElement(x,z,widthScale,depthScale,heightScale,maxh,minh,obj,type) {
    //placeElement(x,z,widthScale,depthScale,obj) {
        let bbox = new THREE.Box3().setFromObject(obj);
        let width = Math.abs(bbox.min.x - bbox.max.x);
        let depth = Math.abs(bbox.min.z - bbox.max.z);
        let height = Math.abs(bbox.min.y - bbox.max.y);

        console.log("treeHeight "+height);

        obj.position.set(x,0,z);
        obj.scale.set(widthScale,heightScale,depthScale);

        let y = 0;
        //Generate terain height pos
        obj.position.set(x,y,z);
        let pos = this.app.terrain.worldToLocal(obj.position.clone());

        y = this.app.terrain.geometry.getHeightAt(pos)+ ((height*heightScale)*0.25);

        let element = new TerrainElement(x,z,widthScale*width,depthScale*depth);

        if(element.intersectsAny(this.elements)) {
            console.log("intersects");
            return false;
        }
        if(y > maxh || y < minh) {
            console.log("out of bounds")
            return false;
        }

        obj.position.set(x,y,z);
        obj.scale.set(widthScale,heightScale,depthScale);

        this.nodelist.push(obj)
        this.elements.push(element);
        return true;
    }

    initTerrainElements(objects) {
        for(let i = 0; i < objects.length; i++ ){ //For all objects
            let obj = objects[i];
            console.log(i)
            let err = 0;
            for(let j = 0 ; j < obj.parameters.numberOfObjects; j++){ //for each element to be created
                console.log(j)
                let newobj = obj.obj.clone();
                let x = Math.random()*(this.app.terrain.geometry.width - 300) + 150;
                let z = Math.random()*(this.app.terrain.geometry.width - 300) + 150;
                let size = (Math.random() * (obj.parameters.maxScale - obj.parameters.minScale)) + obj.parameters.minScale;
                let success = this.placeElement(x,z, size, size,size ,obj.parameters.upperPlacementBound,obj.parameters.lowerPlacementBound, newobj,obj.parameters.type);
                 if(!success) {
                    j-= 1;
                    err ++;
                    console.log("!success");
                }
                if(err > 5) break;//if its hard to place a new element, drop it
            }
        }
    }//END initTerrainElements
}