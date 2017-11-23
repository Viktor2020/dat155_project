class Plane {
    constructor(obj,speed = 10, radius = 1000, height = 450){//,p1,p2,p3,p4,speed = 10) {
        this.obj = obj;
        this.speed = speed;

        this.curve = new THREE.EllipseCurve(
            0,0,
            radius,radius
            );

        this.index = 0;
        this.roti = Math.PI - (Math.PI / 2);

        //this.startCurve.getPoint(0,this.obj.position);
        let newz = this.curve.getPoint(0).y;
        let newx = this.curve.getPoint(0).x;
        this.obj.position.setX(newx);
        this.obj.position.setZ(newz);
        this.obj.position.setY(height);
    }

    update(delta) {
        this.index += delta / this.speed;
        this.roti -= (delta /this.speed)*Math.PI*2;

        this.index = this.index % 1;

        let newz = this.curve.getPoint(this.index).y;
        let newx = this.curve.getPoint(this.index).x;
        this.obj.position.setX(newx);
        this.obj.position.setZ(newz);

        this.obj.rotation.set(0,this.roti,0);

    }
}