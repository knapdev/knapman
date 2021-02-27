'use strict';

import Utils from '../utils/utils.js';

import { Game } from "../game.js";
import { Coord } from "../level/coord.js";

import { Entity } from '../entities/entity.js';

export class Player extends Entity{
    constructor(level, x, y){
        super(level, x, y);

        this.score = 0;
        this.lives = 3;

        this.anim = [16, 17, 18, 19, 18, 17];
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

                if(this.level.hasPellet(this.coord.x, this.coord.y)){
                    this.level.setCell(this.coord.x, this.coord.y, 0);

                    this.game.playSound('munch');

                    this.level.pelletCount--;

                    this.score += Game.PELLET_VALUE;
                    document.getElementById('score').innerText = this.score;
                }

                if(this.level.hasPowerPellet(this.coord.x, this.coord.y)){
                    this.level.setCell(this.coord.x, this.coord.y, 0);

                    this.game.playSound('munch');

                    this.level.pelletCount--;

                    this.score += Game.POWER_PELLET_VALUE;
                    document.getElementById('score').innerText = this.score;
                }
            }
        }
    }

    draw(){
        let px = Utils.lerp(this.coord.x, this.dest.x, this.progress);
        let py = Utils.lerp(this.coord.y, this.dest.y, this.progress);

        this.game.context.save();
        this.game.context.translate(Math.floor((px * Game.TILE_SIZE) + 4), 16 + Math.floor((py * Game.TILE_SIZE) + 4));
        this.game.context.rotate(Utils.degToRad(this.direction * 90));
        this.game.drawSprite(this.anim[Math.floor(this.game.frames * 0.5) % this.anim.length], -4, -4, Game.TILE_SIZE, Game.TILE_SIZE);
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