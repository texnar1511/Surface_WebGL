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

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}