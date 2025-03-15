// < ========================================================
// < Imports
// < ========================================================

import { Game } from './game.js';
import { utils } from './utils.js';

// < ========================================================
// < Exported buttons Object
// < ========================================================

let container = document.getElementById('button-container');

export const buttons = {

    create(id) {
        let button = document.createElement('div');
        button.id = `${id}-button`;
        button.classList.add('button-div')
        button.innerText = utils.title(id);
        container.appendChild(button);
        buttons[id] = button;
        return button;
    },
    
    init() {
        buttons.create('pickup').onclick = () => {
            Game.player.pickup();
            Game.nextPlayer();
            Game.player.act();
        };
        buttons.create('wait').onclick = () => {
            Game.player.wait();
            Game.nextPlayer();
            Game.player.act();
        };
        buttons.create('a').onclick = () => {
            Game.player.act();
        };
    }

}