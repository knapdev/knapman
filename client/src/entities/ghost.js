'use strict';

import Utils from '../utils/utils.js';

import { Game } from '../game.js';
import { Entity } from './entity.js';
import { Direction } from '../level/direction.js';
import { Coord } from '../level/coord.js';
import { State } from '../state/state.js';

export class Ghost extends Entity{

    static State = {
        EXITING: 0,
        CHASING: 1,
        SCATTERING: 2,
        FRIGHTENED: 3,
        EATEN: 4
    };

    constructor(level, x, y, offset = 0){
        super(level, x, y);
        //this.path = this.level.findPath(this.coord, this.level.player.coord);
        this.offset = offset;

        this.lastCoord = new Coord(this.coord.x, this.coord.y);

        this.lairCoord = new Coord(13, 13);
        this.scatterTargetPos = new Coord(26, -3);

        this.anim = [0, 1];

        this.timeoutID = null;

        this.speed = 3;

        this.exit();
    }

    update(delta){
        if(this.coord.isEqual(this.dest)){
            let nextCoord = this.coord;
            switch(this.state){
                case Ghost.State.EXITING:
                    nextCoord = this.getNextCoordTowards(this.exitCoord);
                    if(this.coord.isEqual(this.exitCoord)){
                        this.chase();
                    }
                    break;
                case Ghost.State.CHASING:
                    nextCoord = this.getNextCoordTowards(this.level.player.coord);
                    break;
                case Ghost.State.SCATTERING:
                    nextCoord = this.getNextCoordTowards(this.scatterTargetPos);
                    break;
                case Ghost.State.FRIGHTENED:
                    nextCoord = this.getNextCoordAway(this.level.player.coord);
                    break;
                case Ghost.State.EATEN:
                    nextCoord = this.getNextCoordTowards(this.lairCoord);
                    if(this.coord.isEqual(this.lairCoord)){
                        this.exit();
                    }
                    break;
            }
            this.setDest(nextCoord.x, nextCoord.y);
        }

        if(this.coord.isEqual(this.dest) === false){
            let totalDist = Utils.distance(this.coord, this.dest);
            let tickDist = this.speed * delta;
            let tickPercent = tickDist / totalDist;

            this.progress += tickPercent;

            if(this.progress >= 1){
                this.lastCoord = new Coord(this.coord.x, this.coord.y);
                this.coord = new Coord(this.dest.x, this.dest.y);
                this.progress = 0;

                if(this.coord.x === -1){
                    this.coord = new Coord(28, this.coord.y);
                    this.dest = new Coord(this.coord.x, this.coord.y);
                }else if(this.coord.x === 28){
                    this.coord = new Coord(-1, this.coord.y);
                    this.dest = new Coord(this.coord.x, this.coord.y);
                }
            }
        }
    }

    draw(){
        let px = Utils.lerp(this.coord.x, this.dest.x, this.progress);
        let py = Utils.lerp(this.coord.y, this.dest.y, this.progress);

        this.game.context.save();
        this.game.context.translate(Math.floor((px * Game.TILE_SIZE) + 4), 16 + Math.floor((py * Game.TILE_SIZE) + 4));
        switch(this.state){
            case Ghost.State.EXITING:
            case Ghost.State.CHASING:
            case Ghost.State.SCATTERING:
                this.game.drawSprite(32 + (this.offset * 2) + this.anim[Math.floor(this.game.frames * 0.1) % this.anim.length], -4, -4, Game.TILE_SIZE, Game.TILE_SIZE);
                break;
            case Ghost.State.FRIGHTENED:
                this.game.drawSprite(20 + this.anim[Math.floor(this.game.frames * 0.1) % this.anim.length], -4, -4, Game.TILE_SIZE, Game.TILE_SIZE);
                break;
            case Ghost.State.EATEN:
                this.game.drawSprite(22 + this.anim[Math.floor(this.game.frames * 0.1) % this.anim.length], -4, -4, Game.TILE_SIZE, Game.TILE_SIZE);
                break;
        }
        
        this.game.context.restore();
    }

    scare(){
        this.state = Ghost.State.FRIGHTENED;
        this.speed = 2;
        this.timeoutID = setTimeout(() => {
            this.chase();

            this.timeoutID = null;
        }, 10000);
    }

    eat(){
        this.state = Ghost.State.EATEN;
        this.speed = 6;
        clearTimeout(this.timeoutID);
    }

    chase(){
        this.state = Ghost.State.CHASING;
        this.speed = 3;
    }

    exit(){
        let rand = Math.floor(Math.random() * 2);
        if(rand === 0){
            this.exitCoord = new Coord(13, 11);
        }else{
            this.exitCoord = new Coord(14, 11);
        }

        this.state = Ghost.State.EXITING;
        this.speed = 3;
    }

    reset(){
        super.reset();

        this.state = Ghost.State.EXITING;
    }

    getNextCoordTowards(coord){
        let result = null;
        let lowest = 10000;

        let northNeighbor = this.coord.getNeighbor(Direction.NORTH);
        if(this.level.isWalkable(northNeighbor.x, northNeighbor.y) && northNeighbor.isEqual(this.lastCoord) == false){
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
            if(this.state === Ghost.State.EATEN){
                let dist = Utils.distance(southNeighbor, coord);
                if(dist < lowest){
                    lowest = dist;
                    result = southNeighbor;
                }
            }else{
                if(southNeighbor.isEqual(new Coord(13, 12)) === false && southNeighbor.isEqual(new Coord(14, 12)) === false){
                    let dist = Utils.distance(southNeighbor, coord);
                    if(dist < lowest){
                        lowest = dist;
                        result = southNeighbor;
                    }
                }
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

    getNextCoordAway(coord){
        let result = null;
        let lowest = 0;

        let northNeighbor = this.coord.getNeighbor(Direction.NORTH);
        if(this.level.isWalkable(northNeighbor.x, northNeighbor.y) &&
            northNeighbor.isEqual(this.lastCoord) == false){

            let dist = Utils.distance(northNeighbor, coord);
            if(dist > lowest){
                lowest = dist;
                result = northNeighbor;
            }
        }

        let eastNeighbor = this.coord.getNeighbor(Direction.EAST);
        if(this.level.isWalkable(eastNeighbor.x, eastNeighbor.y) && eastNeighbor.isEqual(this.lastCoord) == false){
            let dist = Utils.distance(eastNeighbor, coord);
            if(dist > lowest){
                lowest = dist;
                result = eastNeighbor;
            }
        }

        let southNeighbor = this.coord.getNeighbor(Direction.SOUTH);
        if(this.level.isWalkable(southNeighbor.x, southNeighbor.y) && southNeighbor.isEqual(this.lastCoord) == false){
            if(this.state === Ghost.State.EATEN){
                let dist = Utils.distance(southNeighbor, coord);
                if(dist > lowest){
                    lowest = dist;
                    result = southNeighbor;
                }
            }else{
                if(southNeighbor.isEqual(new Coord(13, 12)) === false && southNeighbor.isEqual(new Coord(14, 12)) === false){
                    let dist = Utils.distance(southNeighbor, coord);
                    if(dist > lowest){
                        lowest = dist;
                        result = southNeighbor;
                    }
                }
            }
        }

        let westNeighbor = this.coord.getNeighbor(Direction.WEST);
        if(this.level.isWalkable(westNeighbor.x, westNeighbor.y) && westNeighbor.isEqual(this.lastCoord) == false){
            let dist = Utils.distance(westNeighbor, coord);
            if(dist > lowest){
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