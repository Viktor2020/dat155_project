"use strict";

class TerrainElement {
    constructor(x,z,w,d) {
        this.x = x;
        this.z = z;
        this.width = w;
        this.depth = d;
    }

    /**
     * returns true if this element and the argument intersects/ are likely to intersect
     * @param element
     * @returns {boolean}
     */
    intersects(element) {
        let xdist = Math.abs(this.x - element.x);
        let zdist = Math.abs(this.z - element.z);
        console.log("element1: ("+this.x +","+this.z+")" );
        console.log("element2: ("+element.x +","+element.z+")" );
        console.log("xdist: "+xdist+ " zdist: "+zdist);
        console.log(xdist < (this.width + element.width));
        console.log(zdist < (this.depth + element.depth));
        return (xdist < (this.width + element.width) && zdist < (this.depth + element.depth));
    } //end intersects

    intersectsAny(elements) {
        if(elements.length < 1) return false;
        for(var i = 0;i<elements.length;i++) {
            if (this.intersects(elements[i])) return true;
        }
        return false;
    }
}//end terrainElement