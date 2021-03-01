'use strict';

import Keyboard from '../utils/keyboard.js';

import { State } from '../state/state.js';
import { PlayState } from './playstate.js';

export class MenuState extends State{
    constructor(context){
        super(context);
    }

    onEnter(options){

    }

    onExit(){

    }

    update(delta){
        if(Keyboard.getKeyDown(Keyboard.KeyCode.SPACE)){
            this.context.state.pop();
            this.context.state.push(new PlayState(this.context));
        }
    }

    draw(){
        let canvasContext = this.context.context;
        canvasContext.fillStyle = 'white';
        canvasContext.font = '12px Arial';
        canvasContext.fillText('Press SPACE to start!', 0, 0);
    }
}