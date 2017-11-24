"use strict";

class TerrainElements {
    //TODO Cleanup
    constructor(objects,app) {
        this.elements = [];
        this.nodelist = [];
        this.app = app;

        this.initTerrainElements(objects);

    }

    placeElement(x,z,size, widthScale,depthScale,heightScale,maxh,minh,obj) {
    //placeElement(x,z,widthScale,depthScale,obj) {
        let y = 0;

        //Generate terain height pos
        obj.position.set(x,y,z);
        let pos = this.app.terrain.worldToLocal(obj.position.clone());

        y = this.app.terrain.geometry.getHeightAt(pos)+ ((size*heightScale));
        let element = new TerrainElement(x,z,widthScale*size,depthScale*size);

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
                let scale = (Math.random() * (obj.parameters.maxScale - obj.parameters.minScale)) + obj.parameters.minScale;
                //let size = 2;
                let success = this.placeElement(x,z,obj.parameters.size ,scale, scale,scale ,obj.parameters.upperPlacementBound,obj.parameters.lowerPlacementBound, newobj);
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