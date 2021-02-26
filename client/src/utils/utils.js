class Utils {
    constructor(){
    }

    static degToRad(deg){
        return deg * (Math.PI / 180.0);
    }

    static radToDeg(rad){
        return rad * (180.0 / Math.PI);
    }

    static lerp(start, end, percent){
        return (start + percent * (end - start));
    }

    static shortAngleDist(a0,a1) {
        var max = Math.PI*2;
        var da = (a1 - a0) % max;
        return 2*da % max - da;
    }
    
    static lerpAngle(a0,a1,t) {
        return a0 + Utils.shortAngleDist(a0,a1)*t;
    }

    static distance(p1, p2){
        var dx = p2.x-p1.x;
        var dy = p2.y-p1.y;
        return Math.sqrt(dx*dx + dy*dy);
    }
}

export default Utils;