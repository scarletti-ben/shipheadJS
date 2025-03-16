// < ========================================================
// < Imports
// < ========================================================

import { Pile } from './custom-elements/pile.js';
import { Game } from './game.js';
import { utils } from './utils.js';

// < ========================================================
// < Exported Player Class
// < ========================================================

export class Player {

    /** @type {Player[]} */
    static objects = [];

    constructor(nickname, value, flips) {
        this.nickname = nickname;
        this.value = value;
        this.flips = flips;
        this.hand = Pile.create(`${this.nickname}-hand`);
        this.left = Pile.create(`${this.nickname}-left`);
        this.middle = Pile.create(`${this.nickname}-middle`);
        this.right = Pile.create(`${this.nickname}-right`);
        Player.objects.push(this);
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
    // ! EXPERIMENTAL: 'act' instance method
    // ! ========================================================

    _act() {

        Game.update();

        if (!this.isCurrentPlayer) {
            console.log(`It is not ${this.nickname}'s turn`)
            return;
        }

        let eight = Game.getAnchorCard()?.rank === '8';
        if (eight) {
            console.log('seen 8')
        }

        let elligible = Game.player.elligibleCards;
        let cards = elligible.filter(card => Game.accepts(card));

        if (cards.length > 0) {
            console.log('cards found')
            let ranks = cards.map(card => card.rank);
            let rank = utils.choice(ranks);
            let selected = cards.filter(card => card.rank === rank);
            let n = utils.randint(0, selected.length - 1);
            selected.splice(0, n);

            if (n > 0) {
                console.error('SPLICED', n)
            }

            // POSTIT - THIS IS HOW THE AI ADDS TOO MANY CARDS, PERHAPS PENDING SUBMIT / PROCESS BUT WITHOUT TIMER?
            for (let card of selected) {
                center.add(card);
                card.flip(false);
            }

            let fourInARow = Game.fourInARow();

            if (rank === '10' || fourInARow) {
                Game.transferAll(center, burned, false);
                Game.inert = false;
                this.act();
                return;
            } else if (rank !== '7') {
                Game.inert = false;
            } else {
                Game.inert = true;
            }
        } else if (eight && !Game.inert) {
            console.error('waiting')
            this.wait();
        } else {
            this.pickup();
        }

        Game.nextPlayer();
        setTimeout(() => {
            Game.update();
        }, 0);

    }

    act(delay = 350) {
        if (Game.over) return;
        if (delay !== 0) {
            setTimeout(() => {
                this._act();
            }, delay);
        }
        else {
            this._act();
        }
    }

}