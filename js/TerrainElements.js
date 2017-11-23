class TerrainElements {
    constructor(scene, nrOfTrees,nrOfRocks) {
        this.elements = [];
        this.scene = scene;
        this.nrOfTrees = nrOfTrees;
        this.nrOfRocks = nrOfRocks;
        initTerrainElements();
    }

    placeElement(x,z,w,d,maxh,minh,obj) {
        let y = 0;
        let element = new TerrainElement(x,z,w,d);

        if(element.intersectsAny(this.elements)) return false;
        if(y > this.maxH || y < this.minH ) return false;

        obj.position.set(x,y,z);
        this.scene.add(obj);
        this.elements.push(element);
    }

    initTerrainElements() {
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
        }
    }
}