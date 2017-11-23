class Trees {
    //plassering fungerer ikke ennå
  constructor(img,scene) {
    this.treeW = 2.305;
    this.treeH = 5.122;
    this.treeD = 2.76;
    this.scale = 50;

    this.nrOfSubdivisions = 513;//number of subdivisions
    this.image = img;
    this.scene = scene;
    this.heightmap = Utilities.getHeightmapData(img, this.nrOfSubdivisions );
    this.trees = [];
    this.treeVolume = 100;
  }

  //tar ikke hensyn til om det er vann eller andre objeckter hvor trærne spawnes
  placeTree(x,z,tree) {
    let y = (this.heightAt(x,z));

    //alert(y);
    let maxHeight = 1000;
    let minHeight = 0;
    let treeOffsett = 0;
    let sizeOfTree = 150;

    //if(y < maxHeight && y > minHeight && !this.intersectsWithExistingTrees(x,z)) {
      tree.position.set(x,y+treeOffsett,z);
      tree.scale.set(this.scale,this.scale,this.scale);
      this.scene.add(tree);

      //remember treelocation so its easy to check for overlapping trees
      this.trees.push(x);
      this.trees.push(z);

      return true;
   // } else {
    return false;
  //}
  }

  heightAt(x,z) {
    let newx = x + 256;
    let newz = z + 256;

    //let y = z*513+x;
    //let atXZ = this.heightmap[z*513+xx] * 450;//heght
    //let yy = Math.floor(y/513 );/// Math.sqrt(this.heightmap));
    return (this.heightmap[(newz*513) + newx] * 450);
  }

  intersectsWithExistingTrees(x,z) {
    let doesNotIntersect = true;
    for(var i = 0;i<this.trees.length;i+=2) {
      doesNotIntersect = doesNotIntersect && !this.intersects(x,z,this.trees[i],this.trees[i+1]);
    }
    return !doesNotIntersect;
  }

  intersects(x1,z1,x2,z2) {
      let xdist = Math.abs(x1-x2);
      let zdist = Math.abs(z1-z2);
      if(xdist > this.treeVolume || zdist > this.treeVolume) return false
      else return true;
  }
}
