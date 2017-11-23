"use strict";

/**
 * Class responsible for the static decorations on the terrain.
 * Ie. Rocs, trees etc
 */
class Decorations extends THREE.Object3D {

    constructor({objectNames }) {
        super();



        this.objectList = this.init(objectNames);;

    }//END constructor

    //Loads objects and stores them in a object list
    init(objectNames = []) {
        let objects = [];
        let path = 'resources/3Dmodels/';

        console.log(objectNames.length);

        for ( let i = 0; i < objectNames.length; i++ ){
            console.log(objectNames[0]);
            let name = objectNames[i];
            console.log(name);
            let mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath(path);
            //name++/++name
            console.log(name.concat('/').concat(name.concat('.mtl')));
            mtlLoader.load( name.concat('/').concat(name.concat('.mtl')), function (materials) {
                materials.preload();
                let objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath(path);
                objLoader.load(name.concat('/').concat(name.concat('.obj')), function (obj) {
                    obj.name = name;
                    obj.position.set(0, 100, 0);
                    obj.scale.set(100, 100, 100);
                    objects.push(obj);
                    //app.scene.add(obj);
                });
            });
        }

        return objects;
    }//END init
}//END class