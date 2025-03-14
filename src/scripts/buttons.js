// < ========================================================
// < Imports
// < ========================================================

import { Game } from './game.js';

// < ========================================================
// < Exported buttons Object
// < ========================================================

export const buttons = {

    wait: document.getElementById('wait-button'),
    pickup: document.getElementById('pickup-button'),
    act: document.getElementById('act-button'),

    init() {
        // buttons.wait.onclick = () => {
        //     let actions = game.player.getValidActions();
        //     if (actions.includes('wait')) {
        //         game.player.wait(true);
        //         computer.act();
        //     }
        // }

        // buttons.pickup.onclick = () => {
        //     let actions = game.player.getValidActions();
        //     if (actions.includes('pickup')) {
        //         game.player.pickup(true);
        //         setTimeout(() => {
        //             computer.act();
        //         }, 500);
        //     }
        // }

        buttons.act.onclick = () => Game.player.act();

    }

}

// class Button {

//     static objects = [];

//     constructor(id, onclick) {
//         this.element = document.getElementById(id);
//         this.element.onclick = onclick;
//         Button.objects.push(this);
//     }

//     static get elements() {
//         return Button.objects.map(obj => obj.element);
//     }

//     static init() {
//         new Button('wait-button', () => console.log('yee'));
//         new Button('pickup-button', () => console.log('yee'));
//     }

// }