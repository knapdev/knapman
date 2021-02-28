'use strict';

import { Ghost } from "../entities/ghost.js";
import { Player } from "../entities/player.js";
import { Game } from "../game.js";
import Utils from "../utils/utils.js";
import { Coord } from "./coord.js";
import { Direction } from "./direction.js";

export class Level{
    constructor(game){
        this.width = 0;
        this.height = 0;
        this.cells = [];

        this.game = game;

        this.player = null;
        this.ghosts = [];

        this.pelletCount = 0;

        this.wallImage = null;
    }

    getCell(x, y){
        if(this.contains(x, y)){
            return this.cells[y][x];
        }
    }

    setCell(x, y, val){
        if(this.contains(x, y)){
            this.cells[y][x] = val;
        }
    }

    load(data){
        this.width = data.width;
        this.height = data.height;
        console.log(this.width);
        console.log(this.height);

        this.cells = [];
        for(let j = 0; j < this.height; j++){
            this.cells[j] = [];
            for(let i = 0; i < this.width; i++){            
                this.cells[j][i] = 0;
            }
        }

        for(let j = 0; j < this.height; j++){
            for(let i = 0; i < this.width; i++){

                if(data.cells[j][i] == -1){
                    this.player = new Player(this, i, j);
                    this.cells[j][i] = 0;
                }else{
                    this.cells[j][i] = data.cells[j][i];
                }

                if(this.hasPellet(i, j) || this.hasPowerPellet(i, j)){
                    this.pelletCount++;
                }
            }
        }

        this.ghosts.push(new Ghost(this, 12, 15, 0));
        //this.ghosts.push(new Ghost(this, 13, 15, 1));
        //this.ghosts.push(new Ghost(this, 14, 15, 2));
        //this.ghosts.push(new Ghost(this, 15, 15, 3));

        this.createWallImage();
    }

    update(delta){
        this.player.update(delta);

        for(let g in this.ghosts){
            this.ghosts[g].update(delta);
        }
    }

    draw(){
        //draw wall image
        this.game.context.drawImage(this.wallImage, 0, 16);

        //draw pellets/fruit
        for(let j = 0; j < this.height; j++){
            for(let i = 0; i < this.width; i++){
                let cell = this.getCell(i, j);
                if(cell !== 0){
                    let tileIndex = cell;
                    if(cell !== 1){ //If the cell is NOT a wall
                        this.game.drawSprite(tileIndex, Math.floor(i * Game.TILE_SIZE), 16 + Math.floor(j * Game.TILE_SIZE), Game.TILE_SIZE, Game.TILE_SIZE);
                    }
                }
            }
        }

        this.player.draw();

        for(let g in this.ghosts){
            this.ghosts[g].draw();
        }
    }

    isWalkable(x, y){
        //if there is a wall NOT walkable
        //if there is a ghost NOT walkable
        if(this.getCell(x, y) !== 1){
            return true;
        }

        return false;
    }

    hasPellet(x, y){
        if(this.getCell(x, y) === 2){
            return true;
        }

        return false;
    }

    hasPowerPellet(x, y){
        if(this.getCell(x, y) === 3){
            return true;
        }

        return false;
    }

    hasGhost(x, y){
        for(let i = 0; i < this.ghosts.length; i++){
            if(this.ghosts[i].coord.isEqual(new Coord(x, y))){
                if(this.ghosts[i].progress < 0.5){
                    return true;
                }                
            }

            if(this.ghosts[i].dest.isEqual(new Coord(x, y))){
                if(this.ghosts[i].progress >= 0.5){
                    return true;
                }                
            }
        }

        return null;
    }

    hasPlayer(x, y){
        if(this.player.coord.isEqual(new Coord(x, y))){
            if(this.player.progress < 0.5){
                return true;
            }
        }
        if(this.player.dest.isEqual(new Coord(x, y))){
            if(this.player.progress >= 0.5){
                return true;
            }
        }

        return false;
    }

    createWallImage(){
        let offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = this.width * Game.TILE_SIZE;
        offscreenCanvas.height = this.height * Game.TILE_SIZE;

        let offscreenContext = offscreenCanvas.getContext('2d');

        for(let j = 0; j < this.height; j++){
            for(let i = 0; i < this.width; i++){
                let cell = this.getCell(i, j);
                if(cell === 1){ //If the cell is a wall
                    let tileIndex = cell;
                    let configuration = 0;

                    let north = this.getCell(i, j - 1);
                    if(north === 1){
                        configuration += 1;
                    }

                    let west = this.getCell(i - 1, j);
                    if(west === 1){
                        configuration += 2;
                    }

                    let south = this.getCell(i, j + 1);
                    if(south === 1){
                        configuration += 4;
                    }

                    let east = this.getCell(i + 1, j);
                    if(east === 1){
                        configuration += 8;
                    }

                    tileIndex = 240 + configuration;

                    let ix = Math.floor(tileIndex % Game.TILESET_WIDTH) * Game.TILE_SIZE;
                    let iy = Math.floor(tileIndex / Game.TILESET_WIDTH) * Game.TILE_SIZE;
                    let x = Math.floor(i * Game.TILE_SIZE);
                    let y = Math.floor(j * Game.TILE_SIZE);
                    offscreenContext.drawImage(this.game.tileset, ix, iy, Game.TILE_SIZE, Game.TILE_SIZE, x, y, Game.TILE_SIZE, Game.TILE_SIZE);
                }                
            }
        }

        this.wallImage = new Image();
        this.wallImage.src = offscreenCanvas.toDataURL();
    }

    //pathfinding
    findPath(start, end){

        let self = this;

        function Neighbors(x, y){
            let result = [];
            let coord = new Coord(x, y);

            let northNeighbor = coord.getNeighbor(Direction.NORTH);
            if(self.isWalkable(northNeighbor.x, northNeighbor.y)){
                result.push(northNeighbor);
            }

            let eastNeighbor = coord.getNeighbor(Direction.EAST);
            if(self.isWalkable(eastNeighbor.x, eastNeighbor.y)){
                result.push(eastNeighbor);
            }

            let southNeighbor = coord.getNeighbor(Direction.SOUTH);
            if(self.isWalkable(southNeighbor.x, southNeighbor.y)){
                result.push(southNeighbor);
            }

            let westNeighbor = coord.getNeighbor(Direction.WEST);
            if(self.isWalkable(westNeighbor.x, westNeighbor.y)){
                result.push(westNeighbor);
            }

            return result;
        }

        function PathNode(parent, coord){
            let newNode = {
                parent: parent,
                coord: coord,
                f: 0,
                g: 0
            };
            return newNode;
        }

        function calculatePath(){
            //get start and end nodes
            let pathStart = PathNode(null, start);
            let pathEnd = PathNode(null, end);

            let aStar = new Array(self.width * self.height);
            let open = [pathStart];
            let closed = [];
            let result = [];
            let myNeighbors;
            let myNode;
            let myPath;
            let length, max, min;
            while(length = open.length){
                max = self.width * self.height;
                min = -1;
                for(let i = 0; i < length; i++){
                    if(open[i].f < max){
                        max = open[i].f;
                        min = i;
                    }
                }

                myNode = open.splice(min, 1)[0];
                if(myNode.coord.isEqual(pathEnd.coord)){
                    myPath = closed[closed.push(myNode) - 1];
                    do{
                        result.push(new Coord(myPath.coord.x, myPath.coord.y));
                    }while(myPath = myPath.parent);
                    aStar = closed = open = [];
                    result.reverse();
                }else{
                    myNeighbors = Neighbors(myNode.coord.x, myNode.coord.y);
                    for(let i = 0; i < myNeighbors.length; i++){
                        myPath = PathNode(myNode, myNeighbors[i]);
                        if(!aStar[myPath.coord.getHash()]){
                            myPath.g = myNode.g + Utils.distance(myNeighbors[i], myNode.coord);
                            myPath.f = myPath.g + Utils.distance(myNeighbors[i], pathEnd.coord);
                            open.push(myPath);
                            aStar[myPath.coord.getHash()] = true;
                        }
                    }
                    closed.push(myNode);
                }
            }
            return result;
        }
        return calculatePath();
    }

    //helpers
    contains(x, y){
        if(this.inRange(x, this.width) && this.inRange(y, this.height)){
            return true;
        }

        return false;
    }

    inRange(val, max){
        if(val >= 0 && val < max){
            return true;
        }

        return false;
    }
}