(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mathCalc = {}));
})(this, (function (exports) {
    'use strict';

    /**
    * Common utilities
    * @module mathCalc
    */

    var ABRACADABRA = 3;

    var Point2D = class {

        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        calcNorm() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }

        get norm() {
            return this.calcNorm();
        }

    }

    var findPointOnSegment = function (center, target, distance) {
        var n = [target[0] - center[0], target[1] - center[1], target[2] - center[2]];
        var n_length = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
        var result = [center[0] + distance * n[0] / n_length, center[1] + distance * n[1] / n_length, center[2] + distance * n[2] / n_length];
        return result;
    }

    var findPointOnOrtSegment = function (center, target, distance) {
        var n = [target[0] - center[0], target[1] - center[1], target[2] - center[2]];
        var n_length = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
        var n_ort = findOrtVector(n);
        var t = [center[0] + n_ort[0], center[1] + n_ort[1], center[2] + n_ort[2]];
        return findPointOnSegment(center, t, distance);
    }

    var findOrtVector = function (n) {
        var n_ort = [0, 0, 0];
        if (n[2] == 0) {
            n_ort[0] = 0;
            n_ort[2] = -1;
        }
        else if (n[2] > 0) {
            n_ort[0] = 1;
            n_ort[2] = -n[0] / n[2];
        }
        else {
            n_ort[0] = -1;
            n_ort[2] = n[0] / n[2];
        }
        return n_ort;
    }

    var pointOnTriangle = function (x, z, x0, y0, z0, x1, y1, z1, x2, y2, z2) {
        return ((x - x0) * (y1 - y0) * (z2 - z0) + (x1 - x0) * (y2 - y0) * (z - z0) - y0 * (x2 - x0) * (z1 - z0) - (x2 - x0) * (y1 - y0) * (z - z0) + y0 * (x1 - x0) * (z2 - z0) - (x - x0) * (y2 - y0) * (z1 - z0)) / ((x1 - x0) * (z2 - z0) - (x2 - x0) * (z1 - z0));
    }

    var euclidNorm = function (n) {
        var ans = 0.0;
        for (var i = 0; i < n.length; i++) {
            ans += n[i] * n[i];
        }
        return Math.sqrt(ans);
    }

    var multMatVec = function (a, b, c, d, x, y) {
        return [a * x + b * y, c * x + d * y];
    }

    var shift = function (a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    }

    var rotate = function (x, angle) {
        var cosine = Math.cos(angle);
        var sine = Math.sin(angle);
        return multMatVec(cosine, -sine, sine, cosine, x[0], x[1]);
    }

    var shiftRotateShift = function (x, x0, angle) {
        var x_shift = shift(x, x0.map(x => -x));
        var rot = rotate(x_shift, angle);
        return shift(rot, x0);
    }

    var toRadians = (x) => x * Math.PI / 180;

    var toDegrees = (x) => x * 180 / Math.PI;

    exports.ABRACADABRA = ABRACADABRA;
    exports.findPointOnSegment = findPointOnSegment;
    exports.findPointOnOrtSegment = findPointOnOrtSegment;
    exports.findOrtVector = findOrtVector;
    exports.toRadians = toRadians;
    exports.toDegrees = toDegrees;
    exports.pointOnTriangle = pointOnTriangle;
    exports.euclidNorm = euclidNorm;
    exports.multMatVec = multMatVec;
    exports.shift = shift;
    exports.rotate = rotate;
    exports.shiftRotateShift = shiftRotateShift;

    Object.defineProperty(exports, '__esModule', { value: true });

}));