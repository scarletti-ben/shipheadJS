// >> ========================================================
// >> Constants, Variables and Declarations
// >> ========================================================

let suits = ['clubs', 'diamonds', 'hearts', 'spades']
let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
let startValues = [30, 0, 1, 2, 3, 40, 20, 10, 60, 4, 5, 6, 50];
let specialRanks = ['2', '7', '8', '9', '10'];
let information = document.getElementById("information");

// >> ========================================================
// >> Game Object
// >> ========================================================

class Game {
    static turn = 1
    static player = 1
    static inert = false

    static accepts(card) {
        return isValidCard(card);
    }
}

// >> ========================================================
// >> Buttons Object
// >> ========================================================

const buttons = {
    wait: document.getElementById('wait-button'),
    pickup: document.getElementById('pickup-button'),
}

// >> ========================================================
// >> PlayingCard Custom HTML Element / Class
// >> ========================================================

/** 
 * ~ Custom HTML element playing-card  
 * @extends {HTMLElement}  
 */
class PlayingCard extends HTMLElement {

    static setDragged(card) {
        if (Pending.accepts(card) && Game.accepts(card)) {
            Overlays.apply(center.element);
        } else {
            Overlays.apply(center.element, "rgba(180,30,30,0.15)");
        }
        this.dragged = card
    }

    static clearDragged() {
        if (this.dragged) {
            toggleHidden(this.dragged, false);
        }
        this.dragged = null;
    }

    static currentID = 0;

    constructor() {
        super();
        this.initialised = false;
    }

    /** 
     * ~ Get attributes to observe for changes in DOM
     * @returns {string[]}
     */
    static get observedAttributes() {
        return ['rank', 'suit', 'flipped'];
    }

    /** 
     * ~ Get the suit attribute as string
     * @returns {string}  
     */
    get suit() {
        return this.getAttribute('suit');
    }

    /** 
     * ~ Get the rank attribute as string
     * @returns {string}  
     */
    get rank() {
        return this.getAttribute('rank');
    }

    /** 
     * ~ Get the flipped attribute as boolean
     * @returns {boolean}  
     */
    get flipped() {
        return this.getAttribute('flipped') === 'true';
    }

    /** 
     * ~ Create and return a playing-card HTML element, useful as constructor does not take arguments
     * @param {string | number} rank 
     * @param {string} suit 
     * @param {string} [flipped='false'] 
     * @param {string} [draggable='true'] 
     * @returns {PlayingCard}
     * */
    static create(rank, suit, flipped = 'false', draggable = 'true') {
        let card = document.createElement('playing-card');
        card.setAttribute('rank', String(rank).toLowerCase());
        card.setAttribute('suit', suit.toLowerCase());
        card.setAttribute('flipped', flipped);
        card.setAttribute('draggable', draggable);
        card.setAttribute('id', PlayingCard.currentID++);
        return card;
    }

    /** 
     * ~ Update innerHTML of this card to correct code from svgCodes
     * @returns {undefined}
     * */
    updateImage() {
        let flipped = this.getAttribute('flipped') === 'true';
        if (flipped) {
            let key = 'back';
            this.innerHTML = svgCodes[key];
        }
        else {
            let rank = this.rank;
            let suit = this.getAttribute('suit');
            if (rank && suit) {
                let key = `${rank}_${suit}`;
                this.innerHTML = svgCodes[key];
            }
        }
    }

    /** 
     * ~ Simple method to toggle or set flip state  
     * @param {boolean | null} flipped  
     * @returns {undefined}  
     */
    flip(flipped = null) {
        if (flipped === null) {
            flipped = this.getAttribute('flipped') === 'true' ? false : true;
        }
        this.setAttribute('flipped', flipped);
    }

    /** 
     * ~ Callback when an observed attribute changes
     * @param {string} name
     * @param {string} oldValue
     * @param {string} newValue
     * @returns {undefined}
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (this.initialised && oldValue !== newValue) {
            this.updateImage();
        }
    }

    /**
     * ~ Callback when the element is added to the DOM  
     * @returns {undefined}  
     */
    connectedCallback() {
        if (!this.initialised) {
            this.updateImage();
            this.initialised = true;
        }
    }

}
customElements.define('playing-card', PlayingCard);

// >> ========================================================
// >> Overlays Class
// >> ========================================================

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

    // /** 
    //  * ~ Adds an overlay to an element, with timeout to remove it
    //  * @param {HTMLElement} element
    //  * @param {number} milliseconds
    //  * @param {string} color
    //  * @returns {undefined}  
    //  */
    // static temporary(element, milliseconds = 1000, color = 'rgba(0, 180, 120, 0.15)') {
    //     Overlays.apply(element, color);
    //     setTimeout(() => {
    //         Overlays.cleanse(element);
    //     }, milliseconds);
    // }

}

// >> ========================================================
// >> VariableTimer Class
// >> ========================================================

/** 
 * ~ Variable timer that can be paused / resumed and run at different speeds
 */
class VariableTimer {
    /**  
     * ~ Variable timer that can be paused / resumed and run at different speeds
     * @param {number} [milliseconds=1000]
     * @param {number} [speed=1]
     * @param {number} [fps=60]
     */
    constructor(milliseconds = 1000, speed = 1, fps = 60) {
        this.maximum = milliseconds;
        this.remaining = milliseconds;
        this.speed = speed;
        this.fps = fps;
        this.period = 1000 / fps;
        this.callback = null;
        this.interval = null;
    }

    /** 
     * ~ Reset the timer to its maximum duration without affecting interval
     * @returns {undefined}
     */
    resetTimer() {
        this.remaining = this.maximum;
    }

    /** 
     * ~ 
     * @returns {undefined}
     */
    restart(speed = 1, callback = null) {
        console.log('restarted timer')
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.remaining = this.maximum;
        this.speed = speed;
        if (callback) {
            this.callback = callback;
        }
        this.interval = setInterval(() => {
            this.tick();
        }, this.period);
    }

    /** 
     * ~ Clear current interval if found
     * @returns {boolean}
     */
    clearInterval() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = null;
    }

    /** 
     * ~ Clear current callback
     * @returns {undefined}
     */
    clearCallback() {
        this.callback = null;
    }

    /** 
     * ~ Run current callback
     * @returns {undefined}
     */
    runCallback() {
        if (typeof this.callback === 'function') {
            this.callback();
        }
    }

    /** 
     * ~ Set the interval for the timer to tick
     * @returns {undefined}
     */
    setInterval() {
        this.interval = setInterval(() => {
            this.tick();
        }, this.period);
    }

    /** 
     * ~ Reset and start the timer
     * @returns {undefined}
     */
    start() {
        this.resetTimer();
        this.setInterval();
    }

    /** 
     * ~ Pause the timer without resetting the remaining time
     * @returns {undefined}
     */
    pause() {
        this.clearInterval();
    }

    /** 
     * ~ Resume the timer by creating or replacing current interval
     * @returns {undefined}
     */
    resume() {
        this.setInterval();
    }

    /** 
     * ~ Set the speed of the timer, and continue running if needed
     * @param {number} speed
     * @returns {undefined}
     */
    setSpeed(speed) {
        this.speed = speed;
        if (this.interval) {
            this.resume();
        }
    }

    /** 
     * ~ Reduce the time on the timer by the speed value
     * @returns {undefined}
     */
    tick() {
        this.remaining -= this.period * this.speed;
        if (this.remaining <= 0) {
            this.clearInterval();
            this.runCallback();
            this.clearCallback();
        }
    }

    // get running() {
    //     return this.interval !== null;
    // }

    // get ended() {
    //     return this.interval === null;
    // }

}

// >> ========================================================
// >> Pending Class
// >> ========================================================

class Pending {

    /** @type {{ card: PlayingCard, source: Pile }[]} */
    static data = [];

    static duration = 800;
    static slower = 0.2;
    static faster = 1;

    /** @type {VariableTimer} */
    static timer = new VariableTimer(Pending.duration, 1);

    static accepts(card) {
        if (Pending.data.length < 1) {
            return true;
        }
        let rank = Pending.data[0].card.rank;
        return card.rank === rank;
    }

    /** 
     * ~ Text
     * @param {PlayingCard} card
     * @param {number} duration
     * @returns {undefined}
     */
    static submit(card) {

        // POSTIT - Hasmore check is broken for table piles as it cares about cards below not across and so timer gives info about your hidden card
        let source = quick.cardToPile(card);

        let submittedRank = card.rank;
        let hasMore = source.cards.filter(card => card.rank === submittedRank).length > 1;
        let speed = hasMore ? Pending.slower : Pending.faster
        console.log(`Speed: ${speed}`)

        let entry = { 'card': card, 'source': source };
        Pending.data.push(entry);
        center.add(card);
        card.flip(false);

        animateOverlay(card, Pending.duration / speed);

        Pending.timer.restart(speed, () => Pending.process());

    }

    static process() {
        let data = Pending.data;
        let rank = data[0].card.rank;
        let validRanks = currentValidRanks();

        let player = null;
        for (let { card, source } of data) {
            if (!validRanks.includes(card.rank)) {
                player = quick.pileToPlayer(source);
                break;
            }
        }
        if (player) {
            player.pickup()
        }

        Pending.empty();

        if (rank !== '7') {
            Game.inert = false;
        } else {
            Game.inert = true;
        }

        /**
         * ~ Checks if the last four cards in a given array are the same rank
         * @param {PlayingCard[]} cards
         * @returns {boolean}
         */
        function fourInARowPlain(cards) {
            let four = cards.slice(-4);
            if (four.length < 4) {
                return false;
            }
            let rank = four[0].rank;
            let same = four.every(card => card.rank === rank);
            return same;
        }

        let fourInARow = fourInARowPlain(center.cards) || fourInARowPlain(center.cards.filter(card => card.rank !== '7'));

        if (fourInARow || rank === '10') {
            burn(false);
        }
        else {
            switchPlayer(2);
            update();
            setTimeout(() => {
                computer.act();
                update();
            }, 200);
        }
    }

    static empty() {
        console.log('emptying pending data');
        Pending.data = [];
    }

}

// < ========================================================
// < Wrapper Parent Class
// < ========================================================

/** 
 * ~ Wrapper class parent for classes with this.element attribute
*/
class Wrapper {

    /** @type {HTMLElement} */
    element;

    /** @type {Wrapper[]} */
    static objects = [];

    constructor(id) {
        this.element = document.getElementById(id);
        this.constructor.objects.push(this);
    }

    static instanceCheck(obj) {
        if (this !== Wrapper) {
            throw new Error('instanceCheck should only be called from Wrapper class');
        }
        return obj instanceof this;
    }
}

// >> ========================================================
// >> Pile (Wrapper) Class
// >> ========================================================

/** 
 * ~ Pile wrapper for container of playing-card elements
 */
class Pile extends Wrapper {

    /** @type {Pile[]} */
    static objects = [];

    /**  
     * ~ 
     * @returns {PlayingCard[]}
     */
    get cards() {
        let nodes = this.element.querySelectorAll('playing-card');
        let output = Array.from(nodes);
        return output;
    }

    get cardsReversed() {
        let cards = this.cards;
        cards.reverse();
        return cards;
    }

    includes(card) {
        return this.cards.includes(card);
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
        let elements = this.element.querySelectorAll('playing-card');
        return elements[elements.length - 1];
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

    shuffle() {
        let cards = this.cards;
        utils.shuffle(cards);
        for (let card of cards) {
            this.add(card);
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
     * ~ Add a card to the top of this pile  
     * @param {PlayingCard} card  
     * @returns {undefined}  
     */
    add(card, flipped = null) {
        if (flipped !== null) {
            card.flip(flipped);
        }
        this.element.appendChild(card);
    }

    populate(shuffled = true, flipped = true) {
        for (let suit of suits) {
            for (let rank of ranks) {
                let card = PlayingCard.create(rank, suit, flipped);
                this.add(card);
            }
        }
        if (shuffled) {
            this.shuffle();
        }
    }

    /**  
     * ~ 
     * @param {Pile} destination
     * @param {number} n
     * @param {boolean} flipped
     */
    popTo(destination, n = 1, flipped = false) {
        for (let i = 0; i < n; i++) {
            if (this.cards.length > 0) {
                let card = this.top;
                destination.add(card, flipped);
            }
        }
    }
}

// >> ========================================================
// >> Player Class and Subclasses
// >> ========================================================

class Player {

    /** @type {Player[]} */
    static objects = [];

    constructor(nickname, value, secret) {
        this.nickname = nickname;
        this.value = value;
        this.secret = secret;
        this.hand = new Pile(`${this.nickname}-hand`);
        this.left = new Pile(`${this.nickname}-left`);
        this.middle = new Pile(`${this.nickname}-middle`);
        this.right = new Pile(`${this.nickname}-right`);
        Player.objects.push(this);
    }

    wait() {
        Game.inert = true;
        switchPlayer();
    }

    get piles() {
        return [this.hand, this.left, this.middle, this.right];
    }

    pickup(switching = true) {
        transferAll(center, this.hand, this.secret);
        if (switching) {
            switchPlayer();
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

    // /** 
    //  * ~
    //  * @returns {PlayingCard[]}  
    //  */
    // get hand() {
    //     let element = document.getElementById(`${this.name}-hand`);
    //     let nodes = element.querySelectorAll('playing-card');
    //     let cards = Array.from(nodes);
    //     return cards;
    // }

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
        return Game.player === this.value;
    }

    notice(text) {
        return;
        console.log(`${this.nickname}: ${text}`)
    }

    // draw(n = 1, flipped = false) {
    //     for (let i = 0; i < n; i++) {
    //         let card = deck.top;
    //         this.hand.add(card, flipped);
    //     }
    // }

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
        let ranks = currentValidRanks();
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
        let rank = getAnchorRank();
        if (Game.inert || rank !== '8') {
            actions.push('pickup');
        } else {
            actions.push('wait');
        }
        return actions;
    }

}

class Human extends Player {
    constructor() {
        super('human', 1, false)
    }
}

class Computer extends Player {
    constructor() {
        super('computer', 2, true)
    }

    act() {
        update();
        if (!this.isCurrentPlayer) {
            console.log("It is not the computer's turn")
            return;
        }

        let eight = getAnchorCard()?.rank === '8';
        // POSTIT - Seems to be a bug with computer and 8s

        let activeCards = getActiveCards();
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
                transferAll(center, burned);
                // showToast('Computer burned the deck, delaying 1000ms', 3000);
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
            this.wait();
        } else {
            console.log('Picking up', 'hand is', computer.hand.cards.map(card => card.rank), 'center is', center.cards.map(card => card.rank))
            transferAll(center, computer.hand, true);
        }

        switchPlayer();
        setTimeout(() => {
            update();
        }, 0);

    }

}

// >> ========================================================
// >> Utils Class
// >> ========================================================

class utils {
    /**
     * ~ Sorts an array based on a provided key function, with an optional reverse order
     * @param {Array} array
     * @param {Function} key
     * @param {boolean} reverse
     * @returns {Array}
     */
    static sort(array, key, reverse = false) {
        return array.sort((a, b) => {
            const comparison = key(a) - key(b);
            return reverse ? -comparison : comparison;
        });
    }

    /** 
     * ~ Get a random element from an array
     * @param {Array} array
     * @returns {*} A random element from the array
     */
    static choice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /** 
     * ~ Shuffle an array in place  
     * @param {Array} array - The array to shuffle  
     * @returns {undefined}  
     */
    static shuffle(array) {
        let currentIndex = array.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
    }

    static range(func, n = 1) {
        Array.from({ length: n }).forEach(func);
    }

    /**
     * ~ Postpone a callback to the next frame, to avoid JavaScript quirks
     * @param {Function} callback
     * @returns {undefined}
     */
    static postpone(callback) {
        setTimeout(callback, 0);
    }
}

// ! ========================================================
// ! Other Functions
// ! ========================================================

/** 
 * ~ Toggle visibility for an element via .hidden class
 * @param {HTMLElement} element
 * @returns {undefined}
 */
function toggleHidden(element, hidden = null) {
    element.classList.toggle('hidden', hidden);
}

/** 
 * ~ Swtich to the next player, or a given player number
 * @param {number | null} [n=null]
 * @returns {undefined}
 */
function switchPlayer(n = null) {
    if (n !== null) {
        Game.player = n;
    }
    else {
        Game.player = (Game.player % 2) + 1;
    }
    update();
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
        <div>Player: ${Game.player}</div>
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
 * ~ Update function to be called at an interval, drawing cards and sorting hands  
 * @returns {undefined}  
 */
function update() {
    for (let player of [human, computer]) {
        if (player.hasWon()) {
            alert(`${player.nickname} has won`)
            return;
        }
        if (player.hand.length < 5 && deck.length > 0) {
            let quantity = 5 - player.hand.length;
            deck.popTo(player.hand, quantity, player.secret)
        }
    }
    human.hand.sort();
    computer.hand.sort();
    updateInfo();
}

function burn(switching = true) {
    transferAll(center, burned, false);
    if (switching) {
        switchPlayer();
    }
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
 * ~
 * @param {Player} player
 * @returns {undefined}
 */
function distributeStartingCards(player) {
    deck.popTo(player.hand, 5, player.secret);
    for (let pile of player.tablePiles) {
        deck.popTo(pile, 1, true);
        deck.popTo(pile, 1, false);
    }
}

/** 
 * ~ Text
 * @param {Player} player
 * @returns {undefined}
 */
function pickBestShownCards(player) {
    let cards = [...player.handCards, ...player.shownCards];
    for (let card of cards) {
        player.hand.add(card, player.secret);
    }
    utils.sort(cards, (card) => quick.cardToStartValue(card), true);
    player.left.add(cards[0], false);
    player.middle.add(cards[1], false);
    player.right.add(cards[2], false);
}

function getActiveCards() {
    let array;
    let player = Game.player === 1 ? human : computer;
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
            alert(`Player ${Game.player} has won`)
        }
    }
    return array;
}

function isValidCard(card) {
    let validRanks = currentValidRanks();
    let rank = card.rank;
    return validRanks.includes(rank);
}

// >> ========================================================
// >> Quick Object
// >> ========================================================

class quick {

    static cardToPile(card) {
        let piles = Pile.objects;
        for (let pile of piles) {
            if (pile.includes(card)) {
                return pile;
            }
        }
    }

    static cardToStartValue(card) {
        let rankIndex = ranks.indexOf(card.rank);
        let startValue = startValues[rankIndex]
        return startValue;
    }

    static pileToPlayer(pile) {
        let players = Player.objects;
        for (let player of players) {
            if (player.piles.includes(pile)) {
                return player;
            }
        }
    }

    static elementToPile(element) {
        let piles = Pile.objects;
        for (let pile of piles) {
            if (pile.element === element) {
                return pile;
            }
        }
    }

    static numberToPlayer(value) {
        let players = Player.objects;
        for (let player of players) {
            if (player.value === value) {
                return player;
            }
        }
    }

    static idToCard(id) {
        let card = document.getElementById(id);
        return card;
    }
}

// -- ========================================================
// -- Animation Functions
// -- ========================================================

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

/** 
 * ~ Text
 * @param {HTMLElement} element
 * @returns {undefined}
 */
function animateOverlay(element, duration = 1000) {
    const overlay = document.createElement('div');
    // overlay.classList.add('overlay');
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
}

// > ========================================================
// > Event Handler Helper Functions
// > ========================================================

function setDragged(event, card) {
    let clone = card.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.top = "-9999px";
    document.body.appendChild(clone);
    event.dataTransfer.setDragImage(clone, 0, 0);
    PlayingCard.setDragged(card);
    utils.postpone(() => clone.remove());
    utils.postpone(() => toggleHidden(card, true));
}

function clearDragged() {
    PlayingCard.clearDragged();
}

// >> ========================================================
// >> Event Handler Functions
// >> ========================================================

/** 
 * ~
 * @param {Event} event
 * @returns {undefined}
 */
function dragstartHandler(event) {
    console.log('dragstart')
    let card = event.target.closest("playing-card");
    if (!card) {
        event.preventDefault();
        return;
    }
    let activeCards = getActiveCards();
    if (!activeCards.includes(card)) {
        event.preventDefault();
        return;
    }
    setDragged(event, card);
}

/** 
 * ~
 * @param {Event} event
 * @returns {undefined}
 */
function dropHandler(event) {
    event.preventDefault();
    let card = PlayingCard.dragged;
    if (card.flipped || Pending.accepts(card) && Game.accepts(card)) {
        Pending.submit(card);
    }
}

/** 
 * ~
 * @param {Event} event
 * @returns {undefined}
 */
function dragendHandler(event) {
    Overlays.cleanse(center.element);
    PlayingCard.clearDragged();
}

/** 
 * ~
 * @param {Event} event
 * @returns {undefined}
 */
function keydownHandler(event) { }

// >> ========================================================
// >> Core Object Initialisations
// >> ========================================================

let deck = new Pile('deck');
let center = new Pile('center');
let burned = new Pile('burned');
let human = new Human();
let computer = new Computer();

// >> ========================================================
// >> Entry Point Function
// >> ========================================================

/** 
 * ~ Entry point of the application
 * @returns {undefined}  
 */
function main() {
    deck.populate(true, true);
    utils.range(() => deck.top.remove(), 26)

    distributeStartingCards(human);
    distributeStartingCards(computer);
    pickBestShownCards(human);
    pickBestShownCards(computer);
    document.addEventListener("dragstart", dragstartHandler);
    center.element.addEventListener("drop", dropHandler);
    document.addEventListener("dragend", dragendHandler);
    document.addEventListener("dragover", (event) => event.preventDefault());
    document.addEventListener("dragenter", (event) => event.preventDefault());
    document.addEventListener("keydown", keydownHandler);

    buttons.wait.onclick = () => {
        let actions = human.getValidActions();
        if (actions.includes('wait')) {
            human.wait();
            computer.act();
        }
    }

    buttons.pickup.onclick = () => {
        let actions = human.getValidActions();
        if (actions.includes('pickup')) {
            human.pickup(true);
            setTimeout(() => {
                computer.act();
            }, 500);
        }
    }

    update();
};

// >> ========================================================
// >> Execution
// >> ========================================================

main();