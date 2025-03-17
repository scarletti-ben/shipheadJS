// < ========================================================
// < Imports
// < ========================================================

import { Pile } from './custom-elements/pile.js';
import { Game } from './game.js';
import { Pending } from './pending.js';
import { utils } from './utils.js';

// < ========================================================
// < Exported Player Class
// < ========================================================

export class Player {

    /** @type {Player[]} */
    static instances = [];
    static delay = 350;

    constructor(nickname, value, flips) {
        this.nickname = nickname;
        this.value = value;
        this.flips = flips;
        this.hand = Pile.create(`${this.nickname}-hand`);
        this.left = Pile.create(`${this.nickname}-left`);
        this.middle = Pile.create(`${this.nickname}-middle`);
        this.right = Pile.create(`${this.nickname}-right`);
        Player.instances.push(this);
    }

    wait() {
        Game.inert = true;
    }

    get piles() {
        return [this.hand, this.left, this.middle, this.right];
    }

    pickup() {
        Game.transferAll(center, this.hand, this.flips);
    }

    /** 
     * ~
     * @returns {Pile[]}  
     */
    get tablePiles() {
        return [this.left, this.middle, this.right];
    }

    /** 
     * ~
     * @returns {Card[]}  
     */
    get handCards() {
        return this.hand.cards;
    }

    hasWon() {
        return this.elligibleCards.length === 0;
    }

    /** 
     * ~
     * @returns {Card[]}  
     */
    get tableCards() {
        let output = []
        for (let pile of this.tablePiles) {
            output = output.concat(pile.cards);
        }
        return output
    }

    /** 
     * ~
     * @returns {Card[]}  
     */
    get shownCards() {
        return this.tableCards.filter(card => !card.flipped)
    }

    /** 
     * ~
     * @returns {Card[]}  
     */
    get hiddenCards() {
        return this.tableCards.filter(card => card.flipped)
    }

    get elligibleCards() {
        if (this.hand.length > 0) {
            return this.hand.cards;
        }
        else if (this.tableCards.length > 0) {
            if (this.shownCards.length > 0) {
                return this.shownCards;
            }
            return this.hiddenCards;
        }
        else {
            return [];
        }
    }

    get isCurrentPlayer() {
        return Game.player === this;
    }

    notice(text) {
        utils.log(`${this.nickname}: ${text}`)
    }

    refill() {
        let quantity = Math.min(deck.cards.length, 5 - this.hand.length);
        deck.popTo(this.hand, quantity, this.flips)
    }

    /** 
     * ~ 
     * @returns {boolean}
     */
    canPlay() {
        if (!this.isCurrentPlayer) {
            this.notice('Not current player');
            return false;
        }
        let elligibleCards = this.elligibleCards;
        if (elligibleCards.length < 1) {
            this.notice('No elligible cards');
            return false;
        }
        let ranks = Game.currentValidRanks();
        let validCards = elligibleCards.filter(card => ranks.includes(card.rank));
        if (validCards.length < 1) {
            this.notice('No valid cards');
            return false;
        }
        return true;
    }

    getValidActions() {
        let actions = [];
        if (this.canPlay()) {
            actions.push('play');
        }
        if (center.cards.length < 1) {
            return actions;
        }
        let rank = Game.getAnchorRank();
        if (Game.inert || rank !== '8') {
            actions.push('pickup');
        } else {
            actions.push('wait');
        }
        return actions;
    }

    // ! ========================================================
    // ! EXPERIMENTAL
    // ! ========================================================

    _act() {
        utils.assert(this.isCurrentPlayer, `It is not ${this.nickname}'s turn`);
        let anchor = Game.getAnchorRank();
        let available = Game.player.elligibleCards;
        let valid = available.filter(card => Game.accepts(card));
        if (valid.length < 1) {
            if (anchor === '8' && !Game.inert) {
                this.wait();
                Game.nextPlayer();
            }
            else {
                this.pickup();
                Game.nextPlayer();
            }
        } else {
            let ranks = valid.map(card => card.rank);
            let rank = utils.choice(ranks);
            let selected = valid.filter(card => card.rank === rank);
            let n = utils.randint(0, selected.length - 1);
            selected.splice(0, n);
            for (let card of selected) {
                Pending.submit(card, this, false, 0);
            }
        }
    }

    act() {
        if (Game.over) return;
        Game.update();
        if (Game.over) return;
        if (Player.delay !== 0) {
            setTimeout(() => {
                this._act();
            }, Player.delay);
        }
        else {
            this._act();
        }
    }

}