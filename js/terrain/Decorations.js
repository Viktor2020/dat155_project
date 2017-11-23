"use strict";

/**
 * Class responsible for the static decorations on the terrain.
 * Ie. Rocs, trees etc
 */
class Decorations extends THREE.Object3D {

    constructor({objects}) {
        super();
        //TODO: Unwrap objects: 3DModel, parameters
        //objects : 3DModel, parameters
        console.log(objects);

        //this.objectList = this.init(objects);

    }//END constructor


    init(objects) {
        //TODO placement of objects
            //TODO: for each new instance object.clone
    }//END init
}//END class