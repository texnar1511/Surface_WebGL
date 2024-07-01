var Point2D = class {

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    add(p) {
        return new Point2D(this.x + p.x, this.y + p.y);
    }

    sub(p) {
        return new Point2D(this.x - p.x, this.y - p.y);
    }

    neg() {
        return new Point2D(-this.x, -this.y);
    }

}

var Point3D = class {

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    add(p) {
        return new Point2D(this.x + p.x, this.y + p.y, this.z + p.z);
    }

    sub(p) {
        return new Point2D(this.x - p.x, this.y - p.y, this.z - p.z);
    }

    neg() {
        return new Point2D(-this.x, -this.y, -this.z);
    }

}

var Rover = class {

    centerBody;
    speedBody;
    accelerationBody;
    offsetBody;
    angleBody;
    suspension1;
    suspension2;
    lengthLeg;
    radiusWheel;
    N1;
    N2;
    N3;
    N4;
    Delta1;
    Delta2;
    Delta3;
    Delta4;
    massBody;
    P;
    R1;
    R2;
    R3;
    R4;
    gamma;
    accelerationGravity;




    constructor() {

    }
}