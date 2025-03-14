// < ========================================================
// < Imports
// < ========================================================

import { Pile } from './custom-elements/pile.js';
import { Player } from './player.js';
import { Card } from './custom-elements/card.js';
import { Pending } from './pending.js';
import { utils } from './utils.js';

// < ========================================================
// < Exported Game Object
// < ========================================================

export class Game {

    /** @type {Player} */
    static player = null;
    static inert = false;
    static over = false;

    /**
     * > Dictionary of player names mapped to Player instances
     * @type {Object.<string, Player>}
     */
    static players;

    static accepts(card) {

        function pendingAccepts(card) {
            if (Pending.cards.length < 1) {
                utils.log(`Pending.accepts(card) result is ${true}`);
                return true;
            }
            let rank = Pending.cards[0].rank;
            let result = card.rank === rank;
            utils.log(`Pending.accepts(card) result is ${result}`);
            return result;
        }

        function gameAccepts(card) {
            let validRanks = currentValidRanks();
            let rank = card.rank;
            let result = validRanks.includes(rank)
            utils.log(`Game.accepts(card) result is ${result}`)
            return result;
        }

        let pendingAccepted = pendingAccepts(card);
        let gameAccepted = gameAccepts(card);
        let result = pendingAccepted && gameAccepted;
        utils.log(`Game.accepts(card) finalised result is ${result}`)
        return result

    }

    static update() {

        for (let [name, player] of Object.entries(Game.players)) {
            player.hand.sort()
        }

        let validRanks = currentValidRanks();

        let anchorCard = getAnchorCard();
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

    /** 
     * ~ Swtich to the next player, or a given player number
     * @param {Player}
     * @returns {undefined}
     */
    static nextPlayer() {
        let player = Game.player;
        let players = Object.values(Game.players);
        let index = players.indexOf(player);
        index = ++index % players.length;
        Game.player = players[index];
        Game.update();
    }

    static init(playerObject) {
        Game.players = playerObject;
        Game.player = Object.values(playerObject)[0];
        console.log(`PLAYER SET TO ${Game.player}`)
    }

    static populate = populate;
    static distributeStartingCards = distributeStartingCards;
    static pickBestShownCards = pickBestShownCards;
    static getAnchorCard = getAnchorCard;
    static cull = cull;
    static getActiveCards = getActiveCards;
    static transferAll = transferAll;
    static currentValidRanks = currentValidRanks;
    static getAnchorRank = getAnchorRank;

}

// < ========================================================
// < Internal Functions
// < ========================================================

/** 
 * ~ Get list of the valid ranks that can play on a card rank  
 * @param {string} rank    
 * @returns {string[]}  
 */
function getValidRanks(rank) {
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
        // throw new Error("Anchor rank should never be 10");
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

function getAnchorCard() {
    /** @type {Card[]} */
    let cards = center.cards.slice().reverse();
    let pending = Pending.cards;
    for (let card of cards) {
        if (card.rank !== '7' && !pending.includes(card)) {
            return card;
        }
    }
}

function currentValidRanks() {
    let validRanks = Card.ranks;
    let card = getAnchorCard();
    if (card) {
        let rank = card.rank;
        validRanks = getValidRanks(rank);
    }
    return validRanks;
}

function populate(shuffled = true, flipped = true) {
    for (let suit of Card.suits) {
        for (let rank of Card.ranks) {
            let card = Card.create(rank, suit, flipped);
            deck.add(card);
        }
    }
    if (shuffled) {
        deck.shuffle();
    }
}

function cull(quantity = 1) {
    utils.range(() => deck.pop(), quantity);
}

function distributeStartingCards() {
    for (let player of Object.values(Game.players)) {
        deck.popTo(player.hand, 5, player.flips);
        for (let pile of player.tablePiles) {
            deck.popTo(pile, 1, true);
            deck.popTo(pile, 1, false);
        }
    }
}

function pickBestShownCards() {
    for (let player of Object.values(Game.players)) {
        let cards = [...player.handCards, ...player.shownCards];
        for (let card of cards) {
            player.hand.add(card, player.flips);
        }
        utils.sort(cards, (card) => card.startValue, true);
        player.left.add(cards[0], false);
        player.middle.add(cards[1], false);
        player.right.add(cards[2], false);
    }
}

/** 
 * @returns {Card[]}
 */
function getActiveCards() {
    let array;
    /** @type {Player} */
    let player = Game.player;

    if (player.hand.cards.length > 0) {
        array = player.hand.cards;
    }
    else {
        let shown = player.shownCards;
        let hidden = player.hiddenCards;
        if (shown.length > 0) {
            array = shown;
        }
        else if (hidden.length > 0) {
            array = hidden;
        }
        else {
            console.error(`Player ${Game.player} has won`)
            Game.over = true;
        }
    }
    return array;
}

/** 
 * 
 * @param {Pile} source
 * @param {Pile} destination
 * @param {boolean} flipped
 */
function transferAll(source, destination, flipped = false) {
    // POSTIT - NOT DIRECT DESCENDANT SAFE
    /** @type {Card[]} */
    const cards = source.querySelectorAll('playing-card');
    cards.forEach(card => {
        card.flip(flipped);
        destination.add(card);
    });
}

/** 
 * ~ Get the first rank from the center cards that is not a '7'
 * @returns {string | undefined} The first rank that is not '7', or undefined if none found 
 */
function getAnchorRank() {
    let card = getAnchorCard();
    return card?.rank;
}