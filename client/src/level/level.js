'use strict';

import { Player } from "../entities/player.js";
import { Game } from "../game.js";

export class Level{
    constructor(game){
        this.width = 0;
        this.height = 0;
        this.cells = [];

        this.game = game;

        this.player = null;

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

        this.createWallImage();
    }

    update(delta){
        this.player.update(delta);
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