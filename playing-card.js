// < ========================================================
// < PlayingCard Custom HTML Element / Class
// < ========================================================

/** 
 * ~ Custom HTML element playing-card  
 * @extends {HTMLElement}  
 */
class PlayingCard extends HTMLElement {
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

// < ========================================================
// < Execution
// < ========================================================

// > Register the custom element as <playing-card> for DOM usage
customElements.define('playing-card', PlayingCard);