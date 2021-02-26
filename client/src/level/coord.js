'use strict';

import { Direction } from "./direction.js";

export class Coord{
    constructor(x, y){
        this.x = Math.floor(x) || 0;
        this.y = Math.floor(y) || 0;
    }

    getNeighbor(dir){
        switch(dir){
            case Direction.NORTH:
                return this.north();
            case Direction.EAST:
                return this.east();
            case Direction.SOUTH:
                return this.south();
            case Direction.WEST:
                return this.west();
            default:
                console.error(dir + ' is not a direction');
        }   
    }

    north(){
        return new Coord(this.x, this.y - 1);
    }

    east(){
        return new Coord(this.x + 1, this.y);
    }

    south(){
        return new Coord(this.x, this.y + 1);
    }

    west(){
        return new Coord(this.x - 1, this.y);
    }

    isEqual(other){
        if(this.getHash() === other.getHash()){
            return true;
        }else{
            return false;
        }
    }

    getHash(){
        let hash = 42;
        hash = hash * 256 + this.x;
        hash = hash * 256 + this.y;
        return hash;
    }
}