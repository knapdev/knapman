
import { State } from './state.js'

export class StateMachine {
    constructor(){
        this.stateStack = [];
    }

    update(delta){
        if(this.stateStack.length > 0){
            this.stateStack[this.stateStack.length-1].update(delta);
        }
    }

    draw(){
        if(this.stateStack.length > 0){
            this.stateStack[this.stateStack.length-1].draw();
        }
    }

    get(){
        return this.stateStack[this.stateStack.length-1];
    }

    push(state){
        this.stateStack.push(state);
        this.get().onEnter();
    }

    pop(){
        this.get().onExit();
        this.stateStack.pop(); 
    }
}