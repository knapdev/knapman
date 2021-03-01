'use strict';

import Utils from './utils/utils.js';
import Keyboard from './utils/keyboard.js';

import { Direction } from './level/direction.js';

import { Level } from './level/level.js';

import { StateMachine } from './state/statemachine.js';
import { MenuState } from './gamestates/menustate.js';

export class Game{
    static TILESET_WIDTH = 16;
    static TILE_SIZE = 8;

    static PELLET_VALUE = 10;
    static POWER_PELLET_VALUE = 50;

    static FRUIT_CHERRY_VALUE = 100;
    static FRUIT_STRAWBERRY_VALUE = 300;
    static FRUIT_ORANGE_VALUE = 500;
    static FRUIT_APPLE_VALUE = 700;
    static FRUIT_MELON_VALUE = 1000;

    //ghosts

    constructor(){
        this.frames = 0;
        this.then = 0;
        this.frameID = null;

        this.canvas = null;
        this.context = null;

        this.tileset = null;

        this.sounds = [];

        this.state = null;

        this.init();
    }

    init(){
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.resize();

        window.addEventListener('resize', (evnt) => {
            this.resize();
        });

        this.context = this.canvas.getContext('2d');

        this.setupSoundPool('munch', '/client/res/sfx/munch.mp3', 5);

        this.state = new StateMachine();

        //load tileset
        this.loadTileset('/client/res/imgs/tileset.png', () => {

            this.state.push(new MenuState(this));

            this.start();
        });
    }

    start(){
        this.then = performance.now();
        this.frameID = requestAnimationFrame(this.run.bind(this));
    }

    run(now){
        Keyboard._update();

        let delta = (now - this.then) / 1000.0;
        let fps = 1.0 / delta;
        document.getElementById('fps').innerText = fps.toFixed(2);

        this.update(delta);
        this.draw();

        this.frames++;
        this.then = now;
        this.frameID = requestAnimationFrame(this.run.bind(this));
    }

    update(delta){
        this.state.update(delta);
    }

    draw(){
        this.state.draw();
    }

    resize(){
        let scale = 3;
        this.canvas.width = 224;
        this.canvas.height = 248 + 24;
        this.canvas.style.width = (224 * scale) + 'px';
        this.canvas.style.height = ((248 + 24) * scale) + 'px';
    }

    clear(){
        this.context.fillStyle = 'rgb(0, 0, 0)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    loadTileset(filepath, callback){
        this.tileset = new Image();
        this.tileset.src = filepath;
        this.tileset.onload = () => {
            callback();
        }
    }

    drawSprite(index, x, y, w, h, flipped = false){
        let ix = Math.floor(index % Game.TILESET_WIDTH) * Game.TILE_SIZE;
        let iy = Math.floor(index / Game.TILESET_WIDTH) * Game.TILE_SIZE;

        if(flipped){
            this.context.save();
            this.context.translate(x + w, y);
            this.context.scale(-1, 1);
            this.context.drawImage(this.tileset, ix, iy, Game.TILE_SIZE, Game.TILE_SIZE, 0, 0, w, h);
            this.context.restore();
        }else{
            this.context.drawImage(this.tileset, ix, iy, Game.TILE_SIZE, Game.TILE_SIZE, x, y, w, h);
        }
    }

    setupSoundPool(id, filepath, count = 1){
        for(let i = 0; i < count; i++){
            let sound = new Audio(filepath);
            sound.isPlaying = false;
            sound.volume = 0.25;
            sound.addEventListener('ended', () => {
                sound.currentTime = 0;
                sound.isPlaying = false;
            });
            if(this.sounds[id] == null){
                this.sounds[id] = [];
            }
            this.sounds[id][i] = sound;
        }
    }

    playSound(id){
        if(this.sounds[id]){
            for(let i = 0; i < this.sounds[id].length; i++){
                let sound = this.sounds[id][i];
                if(sound.isPlaying === false){
                    sound.play();
                    sound.isPlaying = true;
                    return;
                }
            }
        }
    }
}