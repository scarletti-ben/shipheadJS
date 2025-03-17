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
    static delay = 0;

    constructor(name, value, flips) {
        this.name = name;
        this.value = value;
        this.flips = flips;
        this.blind = Pile.create(`${this.name}-blind`);
        this.shown = Pile.create(`${this.name}-shown`);
        this.hand = Pile.create(`${this.name}-hand`);
        Player.instances.push(this);
    }

    wait() {
        Game.inert = true;
    }

    pickup() {
        Game.transferAll(center, this.hand, this.flips);
    }

    get isCurrentPlayer() {
        return Game.player === this;
    }

    notice(text) {
        utils.log(`${this.name}: ${text}`)
    }

    refill() {
        let quantity = Math.min(deck.cards.length, 5 - this.hand.length);
        deck.popTo(this.hand, quantity, this.flips);
    }

    // ! ========================================================
    // ! ========================================================

    get handCards() {
        return this.hand.cards;
    }

    get shownCards() {
        return this.shown.cards;
    }

    get blindCards() {
        return this.blind.cards;
    }

    get groundCards() {
        return [...this.shownCards, ...this.blindCards]
    }

    get cards() {
        return [...this.handCards, ...this.shownCards, ...this.blindCards];
    }

    get piles() {
        return [this.hand, this.shown, this.blind];
    }

    // ! ========================================================
    // ! ========================================================

    hasWon() {
        return this.availableCards.length === 0;
    }

    get availableCards() {
        if (this.handCards.length > 0) {
            return this.handCards;
        }
        else if (this.shownCards.length > 0) {
            return this.shownCards;
        }
        else if (this.blindCards.length > 0) {
            return this.blindCards
        }
        else {
            return [];
        }
    }

    canPlay() {
        if (!this.isCurrentPlayer) {
            this.notice('Not current player');
            return false;
        }
        let availableCards = this.availableCards;
        if (availableCards.length < 1) {
            this.notice('No available cards');
            return false;
        }
        let ranks = Game.currentValidRanks();
        let validCards = availableCards.filter(card => ranks.includes(card.rank));
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
        utils.assert(this.isCurrentPlayer, `It is not ${this.name}'s turn`);
        let anchor = Game.getAnchorRank();
        let available = Game.player.availableCards;
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
            let possible = valid.filter(card => card.rank === rank);
            // POSTIT
            if (Game.player.blind.includes(possible[0])) {
                console.warn('BLIND, PICKED SINGLE')
                Pending.submit(possible[0], this, false, 0);
                return;
            } else {
                console.log('NOT BLIND');
                let n = utils.randint(0, possible.length - 1);
                possible.splice(0, n);
                for (let card of possible) {
                    Pending.submit(card, this, false, 0);
                }
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