// < ========================================================
// < Imports
// < ========================================================

import { utils } from "./utils.js";
import { Card } from "./custom-elements/card.js";
import { Game } from "./game.js";
import { Pile } from "./custom-elements/pile.js";

// < ========================================================
// < Exported Pending Singleton
// < ========================================================

export class Pending {
    
    /** @type {Card[]} */
    static cards = [];
    
    static duration = 1100;
    static slower = 0.2;
    static faster = 1;
    static timer = null;

    static timeout(ms) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.process(), ms);
    }

    static get rank() {
        if (Pending.cards.length > 0) {
            return Pending.cards[0].rank;
        }
    }

    // ! ========================================================
    // ! EXPERIMENTAL
    // ! ========================================================

    static process() {




        // POSTIT - Check if cards in pending were legal


        /** 
         * 
         * @param {Pile} center
         */
        function getPreviousValid(center) {
            let others = center.cards.filter(c => !Pending.cards.includes(c));
            // console.log('others', others);
            let rank = null;
            if (others.length > 0) {
                let last = others[others.length - 1];
                rank = last.rank;
            }
            console.log('rank', rank);
            let valid = Game.getValidRanks(rank);
            console.log('valid', valid);
            return valid;
        }

        let previousValid = getPreviousValid(center);

        // POSTIT - Check if cards in pending were legal

        let burning = Pending.rank === '10' || Game.fourInARow();
        let seven = Pending.rank === '7';


        let wasAcceptable = previousValid.includes(Pending.rank);
        console.error('ACCEPTABLE', wasAcceptable);

        // POSTIT
        Game.inert = false;

        this.cards = [];
        this.timer = null;

        // POSTIT this is causing overlay issues
        if (!wasAcceptable) {
            Game.player.pickup();
            return Game.nextPlayer(true);
        }

        if (seven) {
            Game.inert = true;
        }
        if (burning) {
            Game.burn();
        } else {
            Game.nextPlayer(true);
        }
    }
}