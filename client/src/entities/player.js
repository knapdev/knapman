'use strict';

import Utils from '../utils/utils.js';

import { Game } from "../game.js";
import { Coord } from "../level/coord.js";

import { Entity } from '../entities/entity.js';

export class Player extends Entity{
    constructor(level, x, y){
        super(level, x, y);
    }

    update(delta){
        //if we ARE at our destination
        if(this.coord.isEqual(this.dest)){
            let neighbor = this.coord.getNeighbor(this.direction);

            if(this.level.isWalkable(neighbor.x, neighbor.y)){
                this.dest = neighbor;
            }
        }else{  //if we are currently NOT at our destination
            let totalDist = Utils.distance(this.coord, this.dest);
            let tickDist = 4 * delta;
            let tickPercent = tickDist / totalDist;

            this.progress += tickPercent;

            if(this.progress >= 1){
                this.coord = this.dest;
                this.progress = 0;
            }
        }
    }

    draw(){
        let px = Utils.lerp(this.coord.x, this.dest.x, this.progress);
        let py = Utils.lerp(this.coord.y, this.dest.y, this.progress);

        this.game.context.save();
        this.game.context.translate(Math.floor((px * Game.TILE_SIZE) + 4), Math.floor((py * Game.TILE_SIZE) + 4));
        this.game.context.rotate(Utils.degToRad(this.direction * 90));
        this.game.drawSprite(17, -4, -4, Game.TILE_SIZE, Game.TILE_SIZE);
        this.game.context.restore();
    }

    setInputDir(dir){
        if(this.coord.isEqual(this.dest)){
            let neighbor = this.coord.getNeighbor(dir);

            if(this.level.isWalkable(neighbor.x, neighbor.y)){
                this.setDir(dir);
            }
        }
    }
}