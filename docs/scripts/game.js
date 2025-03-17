// < ========================================================
// < Imports
// < ========================================================

import { Player } from './player.js';
import { Card } from './custom-elements/card.js';
import { Pending } from './pending.js';
import { utils } from './utils.js';
import { Overlay } from './custom-elements/overlay.js';
import { Pile } from './custom-elements/pile.js';

// < ========================================================
// < Exported Game Object
// < ========================================================

export class Game {

    /** @type {Player} */
    static player = null;
    // static inert = false;
    static over = false;

    static debugging = true;

    static _inert = false;

    static get inert() {
        return Game._inert;
    }

    static set inert(value) {
        console.log(`set inert to ${value}`)
        Game._inert = value
    }

    /**
     * > Dictionary of player names mapped to Player instances
     * @type {Object.<string, Player>}
     */
    static players;

    /** 
     * ~ Swtich to the next player, or a given player number
     * @param {Player}
     * @returns {undefined}
     */
    static nextPlayer(acting = false) {
        let player = Game.player;
        let players = Object.values(Game.players);
        let index = players.indexOf(player);
        index = ++index % players.length;
        Game.player = players[index];
        Game.update();
        if (acting) {
            Game.player.act();
        }
    }

    static init(playersDict) {
        Game.players = playersDict;
        Game.player = Object.values(playersDict)[0];
        console.log(`PLAYER SET TO ${Game.player}`)
    }

    // ! ========================================================
    // ! EXPERIMENTAL: Game logic methods
    // ! ========================================================

    static accepts(card) {

        console.log('INERT', Game.inert)

        function pendingAccepts(card) {
            if (Pending.cards.length < 1) {
                console.log(`Pending.accepts(card)`, true);
                return true;
            }
            let rank = Pending.rank;
            let result = card.rank === rank;
            console.log(`Pending.accepts(card)`, result);
            return result;
        }

        function gameAccepts(card) {
            // Postit
            let validRanks = Game.currentValidRanks();
            let rank = card.rank;
            let result = validRanks.includes(rank)
            console.log(`Game.accepts(card)`, result)
            return result;
        }

        function hiddenAccepts(card = null) {
            let x = Pending.cards.length === 0;
            console.log('Pending.cards.length === 0', x);
            let y = Game.player.elligibleCards.every(c => c.flipped && !Game.player.hand.includes(c))
            console.log('all elligible cards are flipped and not in player hand (GROUND ACTIVE)', y);
            let result = x && y
            console.log(`hiddenAccepts(card) result`, result)
            return result;
        }

        let pendingAccepted = pendingAccepts(card);
        let gameAccepted = gameAccepts(card);
        let hiddenAccepted = hiddenAccepts(card);
        let result = hiddenAccepted || pendingAccepted && gameAccepted
        console.log(`Game.accepts(card) finalised result`, result)
        return result

    }

    static update() {

        for (let player of Object.values(Game.players)) {
            if (player.hasWon()) {
                Game.over = true;
                information.innerHTML = '<div>WIN</div>'
                return;
            }
            else if (deck.cards.length > 0) {
                player.refill();
            }
            // POSTIT - Temporary fix for overlay issue
            setTimeout(() => {
                for (let card of player.handCards) {
                    Overlay.cleanse(card);
                }
            }, 50);
        }

        for (let [name, player] of Object.entries(Game.players)) {
            player.hand.sort()
        }

        let validRanks = Game.currentValidRanks();

        let anchorCard = Game.getAnchorCard();
        let anchorRank = 'N/A';
        if (anchorCard) {
            anchorRank = anchorCard.rank;
        }

        let topCard = center.top;
        let topRank = 'N/A';
        if (topCard) {
            topRank = topCard.rank;
        }


        let human = Game.players.human;
        let actions = human.getValidActions();

        // showToast(`Valid Human Actions: ${actions.join(', ')}`);

        let waitButton = document.getElementById('wait-button');
        if (actions.includes('wait')) {
            waitButton.classList.add('ok');
        } else {
            waitButton.classList.remove('ok');
        }

        let pickupButton = document.getElementById('pickup-button');
        if (actions.includes('pickup')) {
            pickupButton.classList.add('ok');
        } else {
            pickupButton.classList.remove('ok');
        }

        information.innerHTML = `
            <div>Player: ${Game.player.nickname}</div>
            <br>
            <div>Inert: ${Game.inert}</div>
            <div>Top Card: ${topRank}</div>
            <br>
            <div>Valid: ${validRanks.join(' ')}</div>
            <br>
            <div>Anchor Rank: ${anchorRank}</div>
            <br>
            <div>Cards in Deck: ${deck.length}</div>
            <div>Cards in Center: ${center.length}</div>
            <div>Cards in Burned: ${burned.length}</div>
            <div>Total Cards: ${document.querySelectorAll('playing-card').length}</div>
        `;

    }

    static populate(shuffled = true, flipped = true) {
        for (let suit of Card.suits) {
            for (let rank of Card.ranks) {
                let card = Card.create(rank, suit, flipped);
                deck.add(card);
            }
        }
        if (shuffled) deck.shuffle();
    }

    static cull(quantity = 1) {
        deck.popTo(burned, quantity, false)
    }

    static distributeStartingCards() {
        for (let player of Object.values(Game.players)) {
            for (let pile of player.tablePiles) {
                deck.popTo(pile, 1, true);
                deck.popTo(pile, 1, false);
            }
            deck.popTo(player.hand, 5, player.flips);
        }
    }

    static pickBestShownCards() {
        for (let player of Object.values(Game.players)) {
            let cards = [...player.handCards, ...player.shownCards];
            for (let card of cards) player.hand.add(card, player.flips);
            utils.sort(cards, (card) => card.startValue, true);
            player.left.add(cards[0], false);
            player.middle.add(cards[1], false);
            player.right.add(cards[2], false);
        }
    }

    // static getActiveCards() {
    //     let array;
    //     let player = Game.player;

    //     if (player.hand.cards.length > 0) {
    //         array = player.hand.cards;
    //     } else {
    //         let shown = player.shownCards;
    //         let hidden = player.hiddenCards;
    //         if (shown.length > 0) array = shown;
    //         else if (hidden.length > 0) array = hidden;
    //         else {
    //             console.error(`Player ${Game.player} has won`);
    //             Game.over = true;
    //         }
    //     }
    //     return array;
    // }

    static foundRank(rank) {
        return Game.getAnchorRank() === String(rank);
    }

    static foundQuad() {
        return Game.fourInARow();
    }

    static burn() {
        Game.transferAll(center, burned, false);
    }

    static transfer(card, source, destination, flipped = false) {
        if (Game.debugging) {
            if (source === destination) {
                throw new Error('Game.transfer: Source and destination are the same')
            }
            if (source instanceof Pile) {
                if (!source.cards.includes(card)) {
                    throw new Error("Game.transfer: Source Pile does not include card")
                }
            } else {
                if (!source.contains(card)) {
                    throw new Error("Game.transfer: Source Array does not contain card")
                }
            }
    
            console.log("Checking card:");
            console.log(" - card instanceof Card:", card instanceof Card);
            console.log(" - source === Pending.cards:", source === Pending.cards);
            console.log(" - destination === Pending.cards:", destination === Pending.cards);
            
            for (let item of [source, destination]) {
                console.log("\nChecking item:", item);
                console.log(" - toString:", Object.prototype.toString.call(item));
                console.log(" - isArray:", Array.isArray(item));
                if (item instanceof Pile) {
                    console.log(" - Pile.id:", item.id);
                }
            }
        }

        console.log("Setting card flip to", flipped, "from", card.flipped);
        if (destination instanceof Pile) {
            destination.add(card, flipped);
        } else {
            card.flip(flipped);
            destination.push(card)
        }

        if (source instanceof Pile) {
            source.remove(card);
        } else {
            const index = source.indexOf(card);
            if (index !== -1) {
                source.splice(index, 1)
            }
        }

    }

    static transferAll(source, destination, flipped = false) {
        const cards = source.querySelectorAll('playing-card');
        cards.forEach(card => {
            Game.transfer(card, source, destination, flipped);
        });
    }

    static getAnchorCard() {
        let cards = center.cards.slice().reverse();
        let pending = Pending.cards;
        return cards.find(card => card.rank !== '7' && !pending.includes(card));
    }

    static getAnchorRank() {
        return Game.getAnchorCard()?.rank;
    }

    static currentValidRanks() {
        let validRanks = Card.ranks;
        let card = Game.getAnchorCard();
        if (card) validRanks = Game.getValidRanks(card.rank);
        return validRanks;
    }

    /** 
     * ~ Get list of the valid ranks that can play on a card rank  
     * @param {string} rank    
     * @returns {string[]}  
     */
    static getValidRanks(rank) {
        let valid;
        if (rank === null) {
            valid = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        } else if (rank === '2' || rank === '3') {
            valid = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        } else if (rank === '4') {
            valid = ['2', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        } else if (rank === '5') {
            valid = ['2', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        } else if (rank === '6') {
            valid = ['2', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        } else if (rank === '7') {
            valid = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        } else if (rank === '8') {
            if (Game.inert) {
                valid = ['2', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
            }
            else {
                valid = ['8'];
            }
        } else if (rank === '9') {
            if (Game.inert) {
                valid = ['2', '7', '9', '10', 'jack', 'queen', 'king', 'ace'];
            } else {
                valid = ['2', '3', '4', '5', '6', '7', '8', '9'];
            }
        } else if (rank === '10') {
            valid = [];
        } else if (rank === 'jack') {
            valid = ['2', '7', '10', 'jack', 'queen', 'king', 'ace'];
        } else if (rank === 'queen') {
            valid = ['2', '7', '10', 'queen', 'king', 'ace'];
        } else if (rank === 'king') {
            valid = ['2', '7', '10', 'king', 'ace'];
        } else if (rank === 'ace') {
            valid = ['2', '7', '10', 'ace'];
        }
        return valid;
    }

    static fourInARow() {
        return Game.fourInARowPlain(center.cards) || Game.fourInARowPlain(center.cards.filter(card => card.rank !== '7'));
    }

    static fourInARowPlain(cards) {
        let four = cards.slice(-4);
        return four.length === 4 && four.every(card => card.rank === four[0].rank);
    }

}