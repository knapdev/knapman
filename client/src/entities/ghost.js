'use strict';

import Utils from '../utils/utils.js';

import { Game } from '../game.js';
import { Entity } from './entity.js';
import { Direction } from '../level/direction.js';
import { Coord } from '../level/coord.js';

export class Ghost extends Entity{
    constructor(level, x, y, offset = 0){
        super(level, x, y);
        //this.path = this.level.findPath(this.coord, this.level.player.coord);
        this.offset = offset;

        this.lastCoord = new Coord(this.coord.x, this.coord.y);

        this.scatterTargetPos = new Coord(26, -3);

        this.anim = [0, 1];
    }

    update(delta){
        if(this.coord.isEqual(this.dest)){
            //this.path = this.level.findPath(this.coord, this.level.player.coord);
            let nextCoord = this.getNextCoordTowards(this.level.player.coord);
            this.setDest(nextCoord.x, nextCoord.y);
        }

        if(this.coord.isEqual(this.dest) === false){
            let totalDist = Utils.distance(this.coord, this.dest);
            let tickDist = 3 * delta;
            let tickPercent = tickDist / totalDist;

            this.progress += tickPercent;

            if(this.progress >= 1){
                this.lastCoord = new Coord(this.coord.x, this.coord.y);
                this.coord = new Coord(this.dest.x, this.dest.y);
                this.progress = 0;
            }
        }
    }

    draw(){
        let px = Utils.lerp(this.coord.x, this.dest.x, this.progress);
        let py = Utils.lerp(this.coord.y, this.dest.y, this.progress);

        this.game.context.save();
        this.game.context.translate(Math.floor((px * Game.TILE_SIZE) + 4), 16 + Math.floor((py * Game.TILE_SIZE) + 4));
        this.game.drawSprite(32 + (this.offset * 2) + this.anim[Math.floor(this.game.frames * 0.1) % this.anim.length], -4, -4, Game.TILE_SIZE, Game.TILE_SIZE);
        this.game.context.restore();
    }

    getNextCoordTowards(coord){
        let result = null;
        let lowest = 10000;

        let northNeighbor = this.coord.getNeighbor(Direction.NORTH);
        if(this.level.isWalkable(northNeighbor.x, northNeighbor.y) &&
            northNeighbor.isEqual(this.lastCoord) == false){

            let dist = Utils.distance(northNeighbor, coord);
            if(dist < lowest){
                lowest = dist;
                result = northNeighbor;
            }
        }

        let eastNeighbor = this.coord.getNeighbor(Direction.EAST);
        if(this.level.isWalkable(eastNeighbor.x, eastNeighbor.y) && eastNeighbor.isEqual(this.lastCoord) == false){
            let dist = Utils.distance(eastNeighbor, coord);
            if(dist < lowest){
                lowest = dist;
                result = eastNeighbor;
            }
        }

        let southNeighbor = this.coord.getNeighbor(Direction.SOUTH);
        if(this.level.isWalkable(southNeighbor.x, southNeighbor.y) && southNeighbor.isEqual(this.lastCoord) == false){
            let dist = Utils.distance(southNeighbor, coord);
            if(dist < lowest){
                lowest = dist;
                result = southNeighbor;
            }
        }

        let westNeighbor = this.coord.getNeighbor(Direction.WEST);
        if(this.level.isWalkable(westNeighbor.x, westNeighbor.y) && westNeighbor.isEqual(this.lastCoord) == false){
            let dist = Utils.distance(westNeighbor, coord);
            if(dist < lowest){
                lowest = dist;
                result = westNeighbor;
            }
        }

        if(result == null){
            result = this.lastCoord;
        }

        return result;
    }
}