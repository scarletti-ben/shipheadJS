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

    wait(switching) {
        Game.inert = true;
        if (switching === true) {
            Game.nextPlayer();
            return;
        }
        utils.assert(switching === false, "You must pass argument to Player.wait");
    }

    get piles() {
        return [this.hand, this.left, this.middle, this.right];
    }

    pickup(switching = true) {
        Game.transferAll(center, this.hand, this.flips);
        if (switching) {
            Game.nextPlayer();
        }
    }
    
    /** 
     * ~
     * @returns {Pile[]}  
     */
    get tablePiles() {
        return [this.left, this.middle, this.right];
    }

    // /** 
    //  * ~
    //  * @returns {PlayingCard[]}  
    //  */
    // get shown() {
    //     return this.table.filter(card => !card.flipped);
    // }

    // /** 
    //  * ~
    //  * @returns {PlayingCard[]}  
    //  */
    // get hidden() {
    //     return this.table.filter(card => card.flipped);
    // }

    /** 
     * ~
     * @returns {PlayingCard[]}  
     */
    get handCards() {
        return this.hand.cards;
    }

    hasWon() {
        return this.elligibleCards.length === 0;
    }

    /** 
     * ~
     * @returns {PlayingCard[]}  
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
     * @returns {PlayingCard[]}  
     */
    get shownCards() {
        return this.tableCards.filter(card => !card.flipped)
    }

    /** 
     * ~
     * @returns {PlayingCard[]}  
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
        return;
        console.log(`${this.nickname}: ${text}`)
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

    act() {

        if (Game.over) {
            return;
        }
        
        Game.update();

        if (!this.isCurrentPlayer) {
            console.log(`It is not ${this.nickname}'s turn`)
            return;
        }

        let eight = Game.getAnchorCard()?.rank === '8';
        if (eight) {
            // showToast('seen 8');
            console.log('seen 8')
        }

        // POSTIT - Seems to be a bug with computer and 8s

        let activeCards = Game.getActiveCards();

        // let cards = [];
        // if (activeCards) {
        //     cards = activeCards.filter(card => Game.accepts(card))
        // }

        let cards = activeCards.filter(card => Game.accepts(card));

        if (cards.length > 0) {
            let ranks = cards.map(card => card.rank);
            let rank = utils.choice(ranks);
            let selected = cards.filter(card => card.rank === rank);
            for (let card of selected) {
                center.add(card);
                card.flip(false);
            }
            if (rank === '10') {
                Game.transferAll(center, burned, false);
                // showToast('Computer burned the deck, delaying 1000ms', 3000);
                console.log(`${this.nickname} burned the deck, delaying 1000ms, then act again`)
                setTimeout(() => {
                    this.act();
                }, 1000);
                return;
            } else if (rank !== '7') {
                Game.inert = false;
            } else {
                Game.inert = true;
            }
        } else if (eight) {
            console.warn('waiting')
            this.wait(false);
        } else {
            console.log('Picking up', 'hand is', this.hand.cards.map(card => card.rank), 'center is', center.cards.map(card => card.rank))
            Game.transferAll(center, this.hand, this.flips);
        }

        Game.nextPlayer();
        setTimeout(() => {
            Game.update();
        }, 0);

    }

}