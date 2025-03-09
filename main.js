// < ========================================================
// < Constants, Variables and Declarations
// < ========================================================

let suits = ['clubs', 'diamonds', 'hearts', 'spades']
let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
let startValues = [30, 0, 1, 2, 3, 40, 20, 10, 60, 4, 5, 6, 50];
let specialRanks = ['2', '7', '8', '9', '10'];
let information = document.getElementById("information");

// < ========================================================
// < Players
// < ========================================================

let human = new Human();
let computer = new Computer();

// < ========================================================
// < Typed Declarations
// < ========================================================

/** @type {PlayingCard | null} */
let draggedElement = null;

/** @type {ToolbarContainer} */
let toolbarContainer;

/**
 * ~ 
 * @param {HTMLElement} element
 * @param {number} duration
 * @param {number} height
 * @returns {undefined}
 */
function changeHeight(element, duration = 1000, height = 100) {
    const start = performance.now();
    const step = () => {
        const now = performance.now();
        const delta = Math.min((now - start) / duration, 1);
        element.style.height = (delta * height) + "%";
        if (delta < 1) {
            requestAnimationFrame(step);
        }
    };
    step();
}

/**
 * ~ 
 * @param {HTMLElement} element
 * @param {number} duration
 * @param {number} height
 * @returns {undefined}
 */
function growAndDelete(element, duration = 1000, height = 100) {
    changeHeight(element, duration, height);
    setTimeout(() => {
        element.remove()
    }, duration + 1);
}

class Pending {

    /** @type {{ card: PlayingCard, source: Pile }[]} */
    static data = [];

    static empty() {
        console.log('emptying pending data');
        Pending.data = [];
    }

    static submit(card, source, duration = 1000) {
        let playable;
        let data = Pending.data;
        if (data.length > 0) {
            let rank = data[0].card.rank;
            assert(data.every(entry => entry.card.rank === rank));
            playable = card.rank === rank;
        }
        else {
            playable = true;
        }

        let checker = tools.isValidCard(card);
        // console.log('checker', checker)

        if (playable && checker) {

            let entry = { 'card': card, 'source': source };
            data.push(entry);
            center.add(card);
            card.flip(false);
            setTimeout(() => {
                experimental.animateOverlay(card, duration)
            }, 0);

        }
        else {
            console.log(`${card.rank} is not playable`)
        }

    }

    static process() {
        let data = Pending.data;
        if (!data.length > 0) {
            console.log('Nothing to process');
            return false;
        }
        // POSTIT - Current valid ranks does not care about pending
        // Therefore you cannot add a second 10 as it is not valid
        // And the card is essentially only checking if it can be played on itself as it becomes the anchor card
        let ranks = currentValidRanks();
        let issues = false;
        for (let { card, source } of data) {
            if (!ranks.includes(card.rank)) {
                source.add(card);
                issues = true;
            }
        }
        if (issues) {
            console.log('Processor met issues');
            return
        }
        // console.log('Processor met no issues');
        let rank = data[0].card.rank;
        if (rank !== '7') {
            game.inert = false;
        } else {
            game.inert = true;
        }

        setTimeout(() => {
            Pending.empty();
            if (rank === '10') {
                experimental.burn(false);
            }
            else {
                setTimeout(() => {
                    setTimeout(() => {
                        tools.switchPlayer(2);
                        experimental.computerPlayRandom();
                    }, 0);
                }, 0);
            }
            update();
        }, 0);

    }
}

// < ========================================================
// < Overlays Class
// < ========================================================

class Overlays {

    /** @type {HTMLElement[]} */
    static elements = [];

    /**
     * ~ Adds an overlay with a specified color to an element
     * @param {HTMLElement} element
     * @param {string} color
     */
    static apply(element, color = 'rgba(0, 180, 120, 0.15)') {
        let overlay = document.createElement('div');
        overlay.classList.add('overlay');
        element.style.position = 'relative';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.backgroundColor = color;
        overlay.style.pointerEvents = 'none';
        element.appendChild(overlay);
        Overlays.elements.push(element);
    }

    /** 
     * ~ Removes overlay child from a given element
     * @param {HTMLElement} element
     * @returns {undefined}  
     */
    static cleanse(element) {
        if (Overlays.elements.includes(element)) {
            element.style.position = '';
            let overlay = element.querySelector('.overlay');
            if (overlay) {
                element.removeChild(overlay);
            }
            let index = Overlays.elements.indexOf(element);
            if (index !== -1) {
                Overlays.elements.splice(index, 1);
            }
        }
    }

    /** 
     * ~ Adds an overlay to an element, with timeout to remove it
     * @param {HTMLElement} element
     * @param {number} milliseconds
     * @param {string} color
     * @returns {undefined}  
     */
    static temporary(element, milliseconds = 1000, color = 'rgba(0, 180, 120, 0.15)') {
        Overlays.apply(element, color);
        setTimeout(() => {
            Overlays.cleanse(element);
        }, milliseconds);
    }

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
let center = new Pile('center');
let burned = new Pile('burned');
let humanHand = new Pile('human-hand');
let humanL = new Pile('human-left');
let humanM = new Pile('human-middle');
let humanR = new Pile('human-right');
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
 * > Prevents the default action of an event  
 * @param {Event} event - The event to nullify  
 * @returns {null}  
 */
function nullify(event) {
    event.preventDefault();
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
function transferAll(source, destination, flipped = 'false') {
    while (source.element.firstChild) {
        let card = source.element.firstChild;
        card.flip(flipped);
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
        if (cards.length > 0) {
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
    tools.shuffle(pack);
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

    // getValidActions() {
    //     let actions = [];
    //     let rank = getAnchorRank();
    //     if (rank === '8') {
    //         actions.push('wait');
    //     } else {
    //         actions.push('pickup');
    //     }
    //     if (this.canPlay()) {
    //         actions.push('play');
    //     }
    //     return actions;
    // },

    computerPlayRandom() {
        update();
        if (game.player !== 2) {
            console.log("It is not the computer's turn")
            return;
        }

        let eight = getAnchorCard()?.rank === '8';

        let active = experimental.activePile();
        let cards = active.filter(card => tools.isValidCard(card));

        if (cards.length > 0) {
            let ranks = cards.map(card => card.rank);
            let rank = tools.choice(ranks);
            let selected = cards.filter(card => card.rank === rank);
            for (let card of selected) {
                center.add(card);
                card.flip(false);
            }
            if (rank === '10') {
                transferAll(center, burned);
                console.log('Computer played 10, delaying 1000ms')
                setTimeout(() => {
                    experimental.computerPlayRandom();
                }, 1000);
                return;
            } else if (rank !== '7') {
                game.inert = false;
            } else {
                game.inert = true;
            }
        } else if (eight) {
            experimental.waitEight();
        } else {
            console.warn('Picking up', 'hand is', computerHand.cards.map(card => card.rank), 'center is', center.cards.map(card => card.rank))
            transferAll(center, computerHand, true);
        }

        game.player = 1;
        setTimeout(() => {
            update();
        }, 0);

    },

    burn(switching = true) {
        transferAll(center, burned, false);
        if (switching) {
            tools.switchPlayer();
        }
    },

    pickup(switching = true) {
        let pile = game.player === 1 ? humanHand : computerHand;
        let flipped = game.player === 1 ? false : true
        transferAll(center, pile, flipped);
        if (switching) {
            tools.switchPlayer();
        }
    },

    cleanup(event) {
        if (event.propertyName == 'opacity') {
            void this.offsetHeight;
            this.style.opacity = '0'
            this.removeEventListener('transitionend', experimental.cleanup);
        }
    },

    /** 
     * ~ Text
     * @param {HTMLElement} element
     * @returns {undefined}
     */
    animateOverlay(element, duration = 1000) {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '0%',
            backgroundColor: 'rgba(128, 0, 128, 0.5)',
        });
        element.appendChild(overlay);
        growAndDelete(overlay, duration);
    },

    /** 
     * ~ Check if a card is in the active pile
     * @param {PlayingCard} _card
     * @returns {boolean}
     */
    specialCheck(_card) {
        let array;
        if (game.player === 1) {
            if (humanHand.cards.length > 0) {
                array = humanHand.cards;
            }
            else {
                let cards = [...humanL.cards, ...humanM.cards, ...humanR.cards]
                let shown = cards.filter(card => !card.flipped);
                let hidden = cards.filter(card => card.flipped);
                if (shown.length > 0) {
                    array = shown;
                }
                else if (hidden.length > 0) {
                    array = hidden;
                }
                else {
                    alert(`Player ${game.player} has won`)
                }
            }
        } else if (game.player === 2) {
            if (computerHand.cards.length > 0) {
                array = computerHand.cards;
            } else {
                let cards = [...computerL.cards, ...computerM.cards, ...computerR.cards];
                let shown = cards.filter(card => !card.flipped);
                let hidden = cards.filter(card => card.flipped);
                if (shown.length > 0) {
                    array = shown;
                } else if (hidden.length > 0) {
                    array = hidden;
                } else {
                    alert(`Player ${game.player} has won`);
                }
            }
        }
        if (array && array.length > 0) {
            return array.includes(_card);
        }
        return false;
    },

    /** 
     * ~ Get the active pile
     * @returns {PlayingCard[]}
     */
    activePile() {
        let array;
        if (game.player === 1) {
            if (humanHand.cards.length > 0) {
                array = humanHand.cards;
            }
            else {
                let cards = [...humanL.cards, ...humanM.cards, ...humanR.cards]
                let shown = cards.filter(card => !card.flipped);
                let hidden = cards.filter(card => card.flipped);
                if (shown.length > 0) {
                    array = shown;
                }
                else if (hidden.length > 0) {
                    array = hidden;
                }
                else {
                    alert(`Player ${game.player} has won`)
                }
            }
        } else if (game.player === 2) {
            if (computerHand.cards.length > 0) {
                array = computerHand.cards;
            } else {
                let cards = [...computerL.cards, ...computerM.cards, ...computerR.cards];
                let shown = cards.filter(card => !card.flipped);
                let hidden = cards.filter(card => card.flipped);
                if (shown.length > 0) {
                    array = shown;
                } else if (hidden.length > 0) {
                    array = hidden;
                } else {
                    alert(`Player ${game.player} has won`);
                }
            }
        }
        return array;
    },

    showValid() {
        let cards = document.querySelectorAll('playing-card');
        for (let card of cards) {
            let playable = experimental.specialCheck(card);
            let valid = tools.isValidCard(card);
            if (playable && valid) {
                Overlays.temporary(card, 1500, 'rgba(0, 200, 128, 0.4)')
            }
        }
    },

    waitEight() {
        game.inert = true;
        tools.switchPlayer();
    },

};

/**  
 * ~ Assert that a condition is true, throwing an error if false  
 * @param {boolean} condition  
 * @param {string} message
 * @returns {undefined}
 * @throws {Error} If the condition is false  
 */
function assert(condition, message = "Assertion failed") {
    if (!condition) {
        throw new Error(message);
    }
}

// < ========================================================
// < Tools Object
// < ========================================================

/** 
 * ~ Utility functions grouped into an object  
 * @namespace tools  
 */
const tools = {

    /** 
     * ~ Swtich to the next player, or a given player number
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
    },

    /** 
     * ~ Toggle visibility for an element via .hidden class
     * @param {HTMLElement} element
     * @returns {undefined}
     */
    toggle(element) {
        element.classList.toggle('hidden');
    },

    /** 
     * ~ Toggle visibility of information window
     * @returns {undefined}
     */
    toggleInformation() {
        tools.toggle(information);
    },

    /**
     * ~ Checks if an element allows for relative or absolute positioned children
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    allowsPositionedChildren(element) {
        const position = getComputedStyle(element).position;
        return position !== 'static';
    },

    /**
     * ~ Postpone a callback to the next frame, to avoid JavaScript quirks
     * @param {Function} callback
     * @returns {undefined}
     */
    postpone(callback) {
        setTimeout(callback, 0);
    },

    /** 
     * ~ Shuffle an array in place  
     * @param {Array} array - The array to shuffle  
     * @returns {undefined}  
     */
    shuffle(array) {
        let currentIndex = array.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
    },


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

/** 
 * ~ Get list of the valid ranks that can play on the top center card
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
 * ~ Get the first card from the center cards that is not a '7'  
 * @returns {PlayingCard | undefined} The first card not of rank '7', or undefined if none found  
 */
function getAnchorCard() {
    let cards = center.cards.slice().reverse();
    let pending = Pending.data.map(data => data.card);
    for (let card of cards) {
        if (card.rank !== '7' && !pending.includes(card)) {
            return card;
        }
    }
}

/** 
 * ~ Get the first rank from the center cards that is not a '7'
 * @returns {string | undefined} The first rank that is not '7', or undefined if none found 
 */
function getAnchorRank() {
    let card = getAnchorCard();
    return card?.rank;
}

// < ========================================================
// < Initialisation Functions
// < ========================================================

/** 
 * ~ Initialise event listeners for the document  
 * @returns {null}  
 */
function initListeners() {

    let wait = document.getElementById('wait-button');
    wait.onclick = () => {
        let actions = human.getValidActions();
        if (actions.includes('wait')) {
            experimental.waitEight();
            experimental.computerPlayRandom();
        }
    }

    let pickup = document.getElementById('pickup-button');
    pickup.onclick = () => {
        let actions = human.getValidActions();
        if (actions.includes('pickup')) {
            experimental.pickup(true);
            setTimeout(() => {
                experimental.computerPlayRandom();
            }, 500);
        }
    }

    // ! ========================================================
    // ! Drag and Drop Methods
    // ! ========================================================

    document.addEventListener("dragstart", (event) => {

        let card = event.target.closest("playing-card");
        if (!card) {
            return;
        }

        if (!human.canPlay()) {
            console.log('Human cannot drag this, and cannot play');
            // event.preventDefault();
            // return;
        }

        let elligibleCards = human.elligibleCards;
        if (!elligibleCards.includes(card)) {
            console.log('Human cannot drag this, but can play');
            event.preventDefault();
            return;
        }

        draggedElement = card;

        let valid = tools.isValidCard(card);
        if (valid) {
            Overlays.apply(center.element);
        } else {
            Overlays.apply(center.element, "rgba(180,30,30,0.15)");
        }

        let clone = card.cloneNode(true);
        clone.style.position = "absolute";
        clone.style.top = "-9999px";
        document.body.appendChild(clone);
        event.dataTransfer.setDragImage(clone, 0, 0);
        setTimeout(() => document.body.removeChild(clone), 0);

        setTimeout(() => card.style.display = "none", 1);

    });

    center.element.addEventListener("drop", (event) => {
        event.preventDefault();
        let card = draggedElement;
        let duration = 1000;
        let pending = Pending.data.length > 0;
        Pending.submit(card, humanHand, duration);
        if (!pending) {
            setTimeout(() => {
                Pending.process();
            }, duration);
        }
        else {
            console.log('card pending already, implement timer reset and variable speed')
        }
    });

    document.addEventListener("dragend", (event) => {
        if (draggedElement) {
            Overlays.cleanse(center.element);
            draggedElement.style.display = "";
            draggedElement = null;
        }
    });

    // ! ========================================================

    // > Hide the drag not allowed cursor
    document.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    // > Hide the drag not allowed cursor
    document.addEventListener("dragenter", (event) => {
        event.preventDefault();
    });

    // > Handle keyboard key presses
    document.addEventListener("keydown", (e) => {

        if (e.key === ' ') {
            experimental.pickup(true);
            setTimeout(() => {
                experimental.computerPlayRandom();
            }, 500);
        }

        if (e.key === 's') {
            tools.switchPlayer();
        }

        if (e.key === '8') {
            experimental.waitEight();
            experimental.computerPlayRandom();
        }

        if (e.key === 't') {
            let x = getAnchorCard(center, humanHand);
            console.log(x)
        }

        if (e.key === '5') {
            let printer = (array) => `[${array?.join(', ')}]`
            console.log(`Human Actions: ${printer(human.getValidActions())}`);
            console.log(`Computer Actions: ${printer(computer.getValidActions())}`);
        }

        if (e.key === 'x') {
            experimental.showValid();
        }

        if (e.key === 'b') {
            transferAll(center, burned);
        }

        if (e.key === 'r') {
            experimental.computerPlayRandom();
        }

        if (e.key === 'd') {
            draw(humanHand, 'false');
        }

        if (e.key === 'e') {
            experimental.animateOverlay(center.top, 1000);
        }

    });

}

/** 
 * ~ Initialise the toolbarContainer and add buttons
 * @returns {null}  
 */
function initToolbar() {
    toolbarContainer = new ToolbarContainer();
    toolbarContainer.createButton(0, "-", "", null);
    toolbarContainer.createButton(1, "R", "computerPlayRandom", () => experimental.computerPlayRandom());
    toolbarContainer.createButton(2, "P", "pickup", () => experimental.pickup());
    toolbarContainer.createButton(3, "S", "nextPlayer", () => {
        tools.switchPlayer();
        experimental.computerPlayRandom();
    });
    toolbarContainer.createButton(4, "B", "burnCenter", () => experimental.burn());
    toolbarContainer.createButton(5, "I", "toggleInformation", () => tools.toggleInformation());
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

    let topCard = center.top;
    let topRank = 'N/A';
    if (topCard) {
        topRank = topCard.rank;
    }

    let actions = human.getValidActions();
    console.warn(actions);

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
        <div>Cards in Center: ${center.length}</div>
        <div>Cards in Burned: ${burned.length}</div>
        <div>Total Cards: ${document.querySelectorAll('playing-card').length}</div>
    `;
}

/** 
 * ~ Update function to be called at an interval, drawing cards and sorting hands  
 * @returns {undefined}  
 */
function update() {
    if (humanHand.length < 5 && deck.length > 0) {
        draw(humanHand);
    }
    if (computerHand.length < 5 && deck.length > 0) {
        draw(computerHand, true);
    }
    humanHand.sort();
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

    // > Generate cards and shuffle the deck
    populateDeck();

    // > Trim the deck by N cards for testing purposes
    let cullable = deck.cards.filter(card => !specialRanks.includes(card.rank));
    for (let i = 0; i < 22; i++) {
        let card = cullable[i];
        transfer(card, deck, burned);
    }

    // > Deal cards to player hands
    draw(humanHand, false, 5);
    draw(computerHand, true, 5);

    // > Deal cards to piles on the table
    let piles = [humanL, humanM, humanR, computerL, computerM, computerR];
    for (let pile of piles) {
        draw(pile, true);
        draw(pile);
    }

    let combined = human.hand.concat(human.shown);
    for (let card of combined) {
        humanHand.add(card);
    }
    combined.sort((a, b) => startValues[ranks.indexOf(b.rank)] - startValues[ranks.indexOf(a.rank)]);

    humanL.add(combined[0]);
    humanM.add(combined[1]);
    humanR.add(combined[2]);

    combined = computer.hand.concat(computer.shown);
    for (let card of combined) {
        card.flip(true);
        computerHand.add(card);
    }
    combined.sort((a, b) => startValues[ranks.indexOf(b.rank)] - startValues[ranks.indexOf(a.rank)]);
    computerL.add(combined[0]);
    combined[0].flip(false);
    computerM.add(combined[1]);
    combined[1].flip(false);
    computerR.add(combined[2]);
    combined[2].flip(false);


    // > Initialise and update information
    initListeners();
    initToolbar();
    update();

    console.log(`Human: ${humanHand.cards.map(card => card.rank)}`);
    console.log(`Computer: ${computerHand.cards.map(card => card.rank)}`);

}

// < ========================================================
// < Execution
// < ========================================================

main();