// < ========================================================
// < Imports
// < ========================================================

import { utils } from "./utils.js";
import { Card } from "./custom-elements/card.js";
import { Game } from "./game.js";
import { Pile } from "./custom-elements/pile.js";
import { Overlay } from "./custom-elements/overlay.js";

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

    static get rank() {
        if (Pending.cards.length > 0) {
            return Pending.cards[0].rank;
        }
    }

    static timeout(ms = 0, acting = false) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.process(acting), ms);
    }

    static submit(card, player, acting = false, ms = 0) {
        utils.assert(player != null, `Must provide player`);
        Game.transfer(card, card.pile, center, false);
        Pending.cards.push(card);
        // POSTIT - AI is also doing overlays, which is extra overhead
        resetOverlays(ms);
        Pending.timeout(ms, acting);
    }

    // ! ========================================================
    // ! EXPERIMENTAL
    // ! ========================================================

    static process(acting = false) {
        let previousValid = getPreviousValid(center);
        let burning = Pending.rank === '10' || Game.fourInARow();
        let seven = Pending.rank === '7';
        let wasAcceptable = previousValid.includes(Pending.rank);
        Game.inert = false;
        this.cards = [];
        this.timer = null;
        if (!wasAcceptable) {
            console.error(`Cards played by ${Game.player.nickname} were not acceptable`);
            Game.player.pickup();
            return Game.nextPlayer(acting);
        }
        if (seven) {
            Game.inert = true;
        }
        if (burning) {
            Game.burn();
            if (acting) {
                return Game.player.act();
            }
        } else {
            return Game.nextPlayer(acting);
        }
    }
}

// < ========================================================
// < Internal Module Functions
// < ========================================================

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

function resetOverlays(ms) {
    for (let card of Pending.cards) {
        Overlay.cleanse(card);
        let overlay = Overlay.create(card);
        let grow = (progress) => {
            overlay.style.height = (100 * progress) + "%";
        }
        utils.ticker(grow, ms).then(() => Overlay.cleanse(overlay));
    }
}