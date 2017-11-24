"use strict";

class TerrainElements {
    //TODO Cleanup
    constructor(objects,app) {
        this.elements = [];
        this.nodelist = [];
        this.app = app;

        this.initTerrainElements(objects);

    }

    placeElement(x,z,w,d,h,maxh,minh,obj) {
    //placeElement(x,z,w,d,obj) {
        obj.position.set(x,0,z);
        let y = this.app.terrain.geometry.getHeightAt(obj.position);
        let element = new TerrainElement(x,z,w,d);

        //TODO ERROR Here!!
        if(element.intersectsAny(this.elements)) return false;
        if(y > maxh || y < minh) return false;

        obj.scale.set(w,h,d);
        obj.position.set(x,y,z);
        this.nodelist.push(obj)
        this.elements.push(element);
        return true;
    }

    getHeight(x,z) {

    }

    initTerrainElements(objects) {
        for(let i = 0; i < objects.length; i++ ){ //For all objects
            let obj = objects[i];
            console.log(i)
            let err = 0;
            for(let j = 0 ; j < obj.parameters.numberOfObjects; j++){ //for each element to be created
                console.log(j)
                let newobj = obj.obj.clone();
                let x = Math.random()*3000 - 1500;
                let y = Math.random()*3000 - 1500;
                //let size = (Math.random() * (obj.parameters.maxScale - obj.parameters.minScale)) + obj.parameters.minScale;
                let size = 10;
                //alert(typeof obj.parameters.minScale === "undefined");
                let success = this.placeElement(x,y, size, size,size ,obj.parameters.upperPlacementBound,obj.parameters.lowerPlacementBound, newobj);
                 if(!success) {
                    j-= 1;
                    err ++;
                }
                if(err > 5) break;//if its hard to place a new element, drop it
            }
        }
    }//END initTerrainElements
}