// < ========================================================
// < Constants, Variables and Declarations
// < ========================================================

let suits = ['clubs', 'diamonds', 'hearts', 'spades']
let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
let startValues = [30, 0, 1, 2, 3, 40, 20, 10, 60, 4, 5, 6, 50];
let information = document.getElementById("information");

// < ========================================================
// < Typed Declarations
// < ========================================================

/** @type {HTMLElement} */
let overlay;

let overlays = {
    
}

// * ========================================================
// * Toolbar Class
// * ========================================================

/** 
 * ~ Custom #toolbar-container, with .toolbar-row children
 */
class ToolbarContainer {
    constructor() {
        this.element = document.getElementById('toolbar-container');
    }

    // > Add row to the toolbar
    addRow() {
        let row = document.createElement('div');
        row.className = 'toolbar-row';
        this.element.appendChild(row);
    }

    // > Create and add a button to a given row index
    createButton(rowIndex, text, title, onClick = null) {
        let rows = this.element.children.length;
        if (rowIndex >= rows) {
            let needed = rowIndex - rows;
            for (let i = 0; i <= needed; i++) {
                this.addRow();
            }
        }
        const row = this.element.children[rowIndex];
        let button = document.createElement('div');
        button.className = 'toolbar-button';
        button.title = title;
        button.textContent = text;
        if (onClick) {
            button.addEventListener('click', (e) => {
                onClick(e);
            });
        }
        row.appendChild(button);
    }
}

// < ========================================================
// < HTML Wrapper Classes
// < ========================================================

/** 
 * ~ Represents a wrapper for a pile of playing-card elements
 */
class Pile {

    /**  
     * ~ Creates a pile wrapper for the HTML container with the given ID  
     * @param {string} id
     * @returns {PlayingCard}
     */
    constructor(id) {
        this.element = document.getElementById(id);
        if (!this.element) {
            console.log(id);
        }
    }

    /** 
     * ~ Get all card elements in this pile as an array  
     * @returns {PlayingCard[]}  
     */
    get cards() {
        let elements = this.element.querySelectorAll('playing-card');
        return Array.from(elements);
    }

    /** 
     * ~ Get the number of card elements in this pile  
     * @returns {number}  
     */
    get length() {
        return this.cards.length;
    }

    /** 
     * ~ Get the card on the top of this pile  
     * @returns {PlayingCard | undefined}  
     */
    get top() {
        if (this.length > 0) {
            const card = this.cards[this.length - 1];
            return card;
        }
    }

    /** 
     * ~ Remove a specific card from this pile  
     * @param {PlayingCard} card  
     * @returns {undefined}  
     */
    remove(card) {
        if (card && this.element.contains(card)) {
            this.element.removeChild(card);
        }
    }

    /** 
     * ~ Sort all cards in this pile by rank  
     * @returns {undefined}  
     */
    sort() {
        const cards = this.cards;
        cards.sort((a, b) => {
            let indexA = ranks.indexOf(a.rank);
            let indexB = ranks.indexOf(b.rank);
            return indexA - indexB;
        });
        cards.forEach(card => this.add(card));
    }

    /** 
     * ~ Pop a card from the top of this pile  
     * @returns {PlayingCard | undefined}  
     */
    pop() {
        const card = this.top;
        if (card) {
            this.element.removeChild(card);
            return card;
        }
    }

    /** 
     * ~ Add a card to the top of this pile  
     * @param {PlayingCard} card  
     * @returns {undefined}  
     */
    add(card) {
        this.element.appendChild(card);
    }
}

// < ========================================================
// < HTML Wrapper Objects
// < ========================================================

let deck = new Pile('deck');
let played = new Pile('played');
let burned = new Pile('burned');
let playerHand = new Pile('player-hand');
let playerL = new Pile('player-left');
let playerM = new Pile('player-middle');
let playerR = new Pile('player-right');
let computerHand = new Pile('computer-hand');
let computerL = new Pile('computer-left');
let computerM = new Pile('computer-middle');
let computerR = new Pile('computer-right');

// < ========================================================
// < Game Object
// < ========================================================

/** 
 * ~ Game state object containing current information 
 * @namespace game  
 * @property {number} turn
 * @property {number} player 
 * @property {boolean} inert 
 */
const game = {
    turn: 1,
    player: 1,
    inert: false,
};

// < ========================================================
// < Utility Functions
// < ========================================================

/** 
 * ~ Shuffle an array in place  
 * @param {Array} array - The array to shuffle  
 * @returns {undefined}  
 */
function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

/** 
 * ~ Get the remaining number of items in an array or HTMLElement  
 * @param {Array | HTMLElement} object
 * @returns {number}  
 */
function remaining(object) {
    if (Array.isArray(object)) {
        return object.length;
    } else if (object instanceof HTMLElement) {
        return object.children.length;
    }
    return 0;
}

/**
 * ~ Adds an overlay with a specified color to a container, stored as overlay global
 * @param {HTMLElement} container
 * @param {string} color
 */
function applyOverlay(container, color = 'rgba(0, 180, 120, 0.15)') {
    overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = color;
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '10';
    container.style.position = 'relative';
    container.appendChild(overlay);
}

/** 
 * ~ Removes the overlay element from its parent  
 * @returns {undefined}  
 */
function removeOverlay() {
    if (overlay && overlay.parentElement) {
        overlay.parentElement.removeChild(overlay)
    }
}

/**
 * ~ Transfer a given card from one container to another
 * @param {PlayingCard} card
 * @param {Pile} source
 * @param {Pile} destination
 * @returns {undefined}
 */
function transfer(card, source, destination, flipped = false) {
    let cards = source.cards;
    if (cards.includes(card)) {
        source.remove(card);
        destination.add(card);
        card.flip(flipped);
    }
}

/**
 * ~ Transfer all cards from one container to another
 * @param {Pile} source
 * @param {Pile} destination
 * @returns {undefined}
 */
function transferAll(source, destination) {
    while (source.element.firstChild) {
        destination.add(source.element.firstChild);
    }
}

/**
 * ~ Transfer a card from the deck to a given container
 * @param {Pile} destination
 * @returns {undefined}
 */
function draw(destination, flipped = false, n = 1) {
    for (let i = 0; i < n; i++) {
        let cards = deck.cards;
        if (cards) {
            let card = deck.pop();
            card.flip(flipped);
            deck.remove(card);
            destination.add(card);
        }
    }
}

/** 
 * ~ Populate deck pile with playing-card elements and shuffle
 * @returns {undefined}  
 */
function populateDeck() {
    let pack = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            let card = PlayingCard.create(rank, suit);
            pack.push(card);
        }
    }
    shuffle(pack);
    for (let [i, card] of pack.entries()) {
        card.id = `playing-card-${i}`;
        card.flip();
        deck.add(card);
    }
}

// ! ========================================================
// ! Experimental Object
// ! ========================================================

/** 
 * ! Experimental functions grouped into an object  
 * @namespace experimental  
 */
const experimental = {

    computerPlayRandom() {
        update();
        if (game.player !== 2) {
            console.log("It is not the computer's turn")
            return;
        }
        /** @type {PlayingCard} */
        let card;
        let cards = computerHand.cards.filter(card => tools.isValidCard(card));
        if (cards) {
            card = tools.choice(cards);
            played.add(card);
            card.flip(false);
            if (card.rank === '10') {
                transferAll(played, burned);
                experimental.computerPlayRandom();
                return;
            }

        } else {
            transferAll(played, computerHand);
        }
        game.player = 1;
        setTimeout(() => {
            update();
        }, 0);
    }

};

// < ========================================================
// < Tools Object
// < ========================================================

/** 
 * ~ Utility functions grouped into an object  
 * @namespace tools  
 */
const tools = {

    /** 
     * ~ Get the length of a given object  
     * @param {number | null} [n=null]
     * @returns {undefined}
     */ 
    switchPlayer(n = null) {
        if (n !== null) {
            game.player = n;
        }
        else {
            game.player = (game.player % 2) + 1;
        }
        update();
    },

    /** 
     * ~ Get the length of a given object  
     * @param {HTMLElement | Pile | PlayingCard[]} object - The object to check  
     * @returns {number} - The length of the object  
     * @throws {Error} If the object is not a valid type  
     */
    length(object) {
        if (object instanceof Pile) {
            return object.length;
        } else if (object instanceof HTMLElement) {
            return object.children.length;
        } else if (Array.isArray(object)) {
            return object.length;
        }
        throw new Error('UserWarning');
    },

    /** 
     * ~ Get the cards from a given object  
     * @param {HTMLElement | Pile | PlayingCard[]} object 
     * @returns {PlayingCard[]}
     * @throws {Error} If the object is not a valid type
     */
    cards(object) {
        if (object instanceof Pile) {
            return object.cards;
        } else if (object instanceof HTMLElement) {
            return Array.from(object.children);
        } else if (Array.isArray(object)) {
            return object;
        }
        throw new Error('UserWarning');
    },

    /** 
     * ~ Get playing-card element by id
     * @param {string} id
     * @returns {PlayingCard}
     */
    getCard(id) {
        let card = document.getElementById(id);
        return card;
    },

    /** 
     * ~ Check if an element is an instance of PlayingCard  
     * @param {HTMLElement} element - The element to check  
     * @throws {Error} If the element is not an instance of PlayingCard
     * @returns {undefined}  
     */
    cardCheck(element) {
        if (!(element instanceof PlayingCard)) {
            throw new Error("Element is not <playing-card>")
        }
    },

    /** 
     * ~ Get a random element from an array
     * @param {Array} array
     * @returns {*} A random element from the array
     */
    choice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /** 
     * ~ Check if a card is currently valid to play
     * @param {PlayingCard} card
     * @returns {boolean}
     */
    isValidCard(card) {
        let validRanks = currentValidRanks();
        let rank = card.rank;
        return validRanks.includes(rank);
    }

};

// ! ========================================================
// ! Python Translations
// ! ========================================================

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
        if (game.inert) {
            valid = ['2', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        }
        else {
            valid = ['8'];
        }
    } else if (rank === '9') {
        if (game.inert) {
            valid = ['2', '7', '9', '10', 'jack', 'queen', 'king', 'ace'];
        } else {
            valid = ['2', '3', '4', '5', '6', '7', '8', '9'];
        }
    } else if (rank === '10') {
        throw new Error("Anchor rank should never be 10");
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

/** 
 * ~ Get list of the valid ranks that can play on the top played card
 * @returns {Array<number | string>}
 */
function currentValidRanks() {
    let validRanks = ranks;
    let card = getAnchorCard();
    if (card) {
        let rank = card.rank;
        validRanks = getValidRanks(rank);
    }
    return validRanks;
}

/** 
 * ~ Get the first card from the played cards that is not a '7'  
 * @returns {PlayingCard | undefined} The first card not of rank '7', or undefined if none found  
 */
function getAnchorCard() {
    let cards = played.cards.slice().reverse()
    for (let card of cards) {
        if (card.rank !== '7') {
            return card;
        }  
    }
}

// < ========================================================
// < Initialisation Functions
// < ========================================================

/** 
 * ~ Initialise event listeners for the document  
 * @returns {null}  
 */
function initListeners() {

    // > Attach anonymous function call to document click event
    document.addEventListener("click", () => {

    });

    // > Hide the drag not allowed cursor
    document.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    // > Hide the drag not allowed cursor
    document.addEventListener("dragenter", (event) => {
        event.preventDefault();
    });

    // > Attach anonymous function call to document click event
    document.addEventListener("keydown", (e) => {
        if (e.key === '1') {
            let card = PlayingCard.create('2', 'clubs');
            played.add(card);
        }
        if (e.key === ' ') {
            transferAll(played, playerHand);
        }
        
        if (e.key === 's') {
            tools.switchPlayer();
        }

        if (e.key === 't') {
            let x = getAnchorCard(played, playerHand);
            console.log(x)
        }

        if (e.key === 's') {
            playerHand.sort();
        }

        if (e.key === 'b') {
            transferAll(played, burned);
        }

        if (e.key === 'r') {
            experimental.computerPlayRandom();
        }

        if (e.key === 'd') {
            draw(playerHand, 'false');
        }
    });

    played.element.addEventListener("drop", (event) => {
        event.preventDefault();

        let id = event.dataTransfer.getData('id');
        const card = tools.getCard(id);

        let validRanks = currentValidRanks();
        let rank = card.rank;
        if (!validRanks.includes(rank)) {
            return;
        }

        played.add(card);
        card.flip(false);

        if (rank === '10') {
            transferAll(played, burned);
            setTimeout(() => {
                update();
            }, 0);
        }

        game.player = 2;

        setTimeout(() => {
            update();
            experimental.computerPlayRandom();
        }, 500);
        
    });

}

/** 
 * ~ Initialise callback intervals for the document  
 * @returns {null}  
 */
function initIntervals() {

    setInterval(() => {
        update();
    }, 1000);

}

// < ========================================================
// < Update Functions
// < ========================================================

/** 
 * ~ Update the text in #information based on current game state
 * @returns {undefined}
 */
function updateInfo() {

    let validRanks = currentValidRanks();
    let anchorCard = getAnchorCard();
    let anchorRank = 'N/A';
    if (anchorCard) {
        anchorRank = anchorCard.rank;
    }

    let topCard = played.top;
    let topRank = 'N/A';
    if (topCard) {
        topRank = topCard.rank;
    }

    information.innerHTML = `
        <div>Player: ${game.player}</div>
        <br>
        <div>Inert: ${game.inert}</div>
        <div>Top Card: ${topRank}</div>
        <br>
        <div>Valid: ${validRanks.join(' ')}</div>
        <br>
        <div>Anchor Rank: ${anchorRank}</div>
        <br>
        <div>Cards in Deck: ${deck.length}</div>
        <div>Cards in Played: ${played.length}</div>
        <div>Cards in Burned: ${burned.length}</div>
        <div>Total Cards: ${document.querySelectorAll('playing-card').length}</div>
    `;
}

/** 
 * ~ Update function to be called at an interval, drawing cards and sorting hands  
 * @returns {undefined}  
 */
function update() {
    if (playerHand.length < 5 && deck.length > 0) {
        draw(playerHand);
    }
    if (computerHand.length < 5 && deck.length > 0) {
        draw(computerHand, true);
    }
    playerHand.sort();
    computerHand.sort();
    updateInfo();
}

// < ========================================================
// < Entry Point Function
// < ========================================================

/** 
 * ~ Entry point of the application
 * @returns {undefined}  
 */
function main() {

    let tbc = new ToolbarContainer();
    tbc.createButton(0, "-", "", null);
    tbc.createButton(1, "R", "computerPlayRandom", () => experimental.computerPlayRandom());
    tbc.createButton(2, "P", "pickup", () => transferAll(played, playerHand));
    tbc.createButton(3, "S", "nextPlayer", () => {
        tools.switchPlayer();
        experimental.computerPlayRandom();
    });
    tbc.createButton(4, "B", "burnPlayed", () => transferAll(played, burned));

    populateDeck();
    draw(playerHand, false, 5);
    draw(computerHand, true, 5);

    let piles = [playerL, playerM, playerR, computerL, computerM, computerR];
    for (let pile of piles) {
        draw(pile, true);
        draw(pile);
    }

    for (let i = 0; i < 26; i++) {
        let card = deck.top;
        transfer(card, deck, burned, true);
    }

    initListeners();
    // initIntervals();
    update();
}

// < ========================================================
// < Execution
// < ========================================================

main();