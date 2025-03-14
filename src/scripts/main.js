// < ========================================================
// < Imports
// < ========================================================

import { utils } from './utils.js';
import { Card } from './custom-elements/card.js';
import { Overlay } from './custom-elements/overlay.js';
import { Pile } from './custom-elements/pile.js';
import { Player } from './player.js';
import { Game } from './game.js';
import { handlers } from './handlers.js';
import { buttons } from './buttons.js';

// < ========================================================
// < Registration of Custom HTML Elements
// < ========================================================

Card.register();
Overlay.register();
Pile.register();

// < ========================================================
// < Queries for HTML Elements
// < ========================================================

let page = document.getElementById('page');
let information = document.getElementById('information');

// < ========================================================
// < Instantiation of Custom HTML Elements
// < ========================================================

let deck = Pile.create('deck', page);
let center = Pile.create('center', page)
let burned = Pile.create('burned', page)

// < ========================================================
// < Instantiation of Other Objects
// < ========================================================

let human = new Player('human', 0, false);
let computer = new Player('computer', 1, true);

// < ========================================================
// < Functions
// < ========================================================

function checker(booleanFunction, ms = 5) {
    setInterval(() => {
        let result = booleanFunction();
        information.innerText = `Result: ${result}`
    }, ms);
}

// < ========================================================
// < Entry Point
// < ========================================================

function main() {
    handlers.init();
    buttons.init();
    Game.init({ human, computer });
    Game.populate(true, true);
    Game.cull(26);
    Game.distributeStartingCards();
    Game.pickBestShownCards();
    Game.update();
}

// < ========================================================
// < Execution
// < ========================================================

main();