class TerrainElements {
    constructor(objects) {
        this.elements = [];
        this.nodelist = [];
        this.objects = objects;
        //this.nrOfTrees = 50;
        //this.nrOfRocks = 100;

        initTerrainElements(objects);

    }

    placeElement(x,z,w,d,maxh,minh,obj) {
        let y = 0;
        let element = new TerrainElement(x,z,w,d);
        let newObject = obj.clone();

        if(element.intersectsAny(this.elements)) return false;
        if(y > this.maxH || y < this.minH ) return false;

        newObject.position.set(x,y,z);
        nodelist.push(newObject)
        this.elements.push(element);
    }

    initTerrainElements(objects) {
        /**
        let rw = 5;
        let rd = 5;
        let tw = 100;
        let td = 100;
        let tree = OBJLoader('resources/3Dmodels/lowPolyTree/lowpolytree.obj');
        let rock = OBJLoader('resources/3Dmodels/lowPolyTree/lowpolytree.obj');

        for(let i = 0;i<this.nrOfTrees;i++) {
            let success = this.placeElement(Math.random()*500,Math.random()*500,tw,td,tree.clone());
            if(!success) i-= 1;
        }
        for(let i = 0;i<this.nrOfRocks;i++) {
            let success = this.placeElement(Math.random()*500,Math.random()*500,trw,rd,rock.clone());
            if(!success) i-= 1;
        }*/
        for(let i = 0; i < objects.length; i++ ){ //For all objects
            let obj = objects[i];
            for(let j = 0 ; j < obj.parameters.numberOfObjects; j++){ //for each element to be created
                let success = this.placeElement(Math.random()*500,Math.random()*500,100,100,obj);
                if(!success) i-= 1;
            }
        }
    }//END initTerrainElements
}