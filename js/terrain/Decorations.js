"use strict";
//TODO DEPRECATED!

/**
 * Class responsible for the static decorations on the terrain.
 * Ie. Rocs, trees etc
 */
class Decorations extends THREE.Object3D {

    constructor({objects}) {
        super();
        //TODO: Unwrap objects: 3DModel, parameters

        //objects : 3DModel, parameters
        super();

        //this.objectList = this.init(objects);

    }//END constructor

    //Loads objects and stores them in a object list
    init(objects) {

        let witth = 3000;
        let numberOfElements = 100;

        for(let i = 0; i < objects.length; i++) {
            //TODO placement of objects
            for(let j = 0; j < numberOfElements; j++) {
            let rx = Math.random() * witth - 0.5 * witth;
            let ry = Math.random() * witth - 0.5 * witth;
            let telem = TerrainElement(rx, ry, parameters.maxScale, parameters.maxScale);

                //TODO: for each new instance object.clone

            }
        }
    }//END init
}//END class