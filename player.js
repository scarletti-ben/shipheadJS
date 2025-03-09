
class validator {

    static process(cards) {
        let ranks = currentValidRanks();
        return cards.filter(card => ranks.includes(card.rank));
    }

}

/** 
 * ~ Thing
 */
class Player {
    name = null;
    identifier = null;

    /** 
     * ~
     * @returns {PlayingCard[]}  
     */
    get table() {
        let sides = ['left', 'middle', 'right'];
        let output = [];
        for (let side of sides) {
            let element = document.getElementById(`${this.name}-${side}`);
            let nodes = element.querySelectorAll('playing-card');
            let cards = Array.from(nodes);
            output.push(...cards);
        }
        return output;
    }

    /** 
     * ~
     * @returns {PlayingCard[]}  
     */
    get shown() {
        return this.table.filter(card => !card.flipped);
    }

    /** 
     * ~
     * @returns {PlayingCard[]}  
     */
    get hidden() {
        return this.table.filter(card => card.flipped);
    }

    /** 
     * ~
     * @returns {PlayingCard[]}  
     */
    get hand() {
        let element = document.getElementById(`${this.name}-hand`);
        let nodes = element.querySelectorAll('playing-card');
        let cards = Array.from(nodes);
        return cards;
    }

    get elligibleCards() {
        if (this.hand.length > 0) {
            return this.hand;
        }
        else if (this.table.length > 0) {
            if (this.shown.length > 0) {
                return this.shown;
            }
            return this.hidden;
        }
        else {
            return [];
        }
    }

    get isCurrentPlayer() {
        return game.player === this.identifier;
    }

    notice(text) {
        console.log(`${this.name}: ${text}`)
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
        let validCards = validator.process(elligibleCards);
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
        let rank = getAnchorRank();
        if (game.inert || rank !== '8') {
            actions.push('pickup');
        } else {
            actions.push('wait');
        }
        return actions;
    }

}

class Human extends Player {
    name = 'human';
    identifier = 1;
}

class Computer extends Player {
    name = 'computer';
    identifier = 2;
}