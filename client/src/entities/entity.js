'use strict';

import { Coord } from '../level/coord.js';
import { Direction } from '../level/direction.js';

export class Entity{
    constructor(level, x, y){
        this.coord = new Coord(x, y);
        this.startingCoord = new Coord(x, y);
        this.dest = new Coord(x, y);
        this.progress = 0;
        this.direction = Direction.NORTH;
        this.speed = 4

        this.level = level;
        this.game = level.game;
    }

    update(delta){

    }

    draw(){

    }

    setCoord(x, y){
        this.coord = new Coord(x, y);
    }

    setDest(x, y){
        this.dest = new Coord(x, y);
    }

    setDir(dir){
        this.direction = dir;
    }

    reset(){
        this.coord = new Coord(this.startingCoord.x, this.startingCoord.y);
        this.dest = new Coord(this.coord.x, this.coord.y);
        this.progress = 0;

        this.direction = Direction.NORTH;
    }
}