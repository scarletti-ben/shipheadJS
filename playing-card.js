// < ========================================================
// < PlayingCard Custom HTML Element / Class
// < ========================================================

class PlayingCard extends HTMLElement {
    static get observedAttributes() {
        return ['rank', 'suit', 'flipped'];
    }
    constructor() {
        super();
        this.initialised = false;
    }

    /** 
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

    // > Update the img child of this card
    updateImage() {
        let flipped = this.getAttribute('flipped') === 'true';
        if (flipped) {
            let key = 'back';
            this.innerHTML = codes[key];
        }
        else {
            let rank = this.getAttribute('rank');
            let suit = this.getAttribute('suit');
            let key = `${rank}_${suit}`;
            this.innerHTML = codes[key];
        }
    }

    // > Simple method to flip the card
    flip() {
        let flipped = this.getAttribute('flipped') === 'true';
        this.setAttribute('flipped', !flipped);
    }

    // ~ ========================================================
    // ~ Magic Methods
    // ~ ========================================================

    // ~ Callback when an observed attribute changes
    attributeChangedCallback(name, current, value) {
        if (this.initialised) {
            this.updateImage();
        }
    }

    // ~ Callback when the element is added to the DOM
    connectedCallback() {
        if (!this.initialised) {
            this.updateImage();
            this.addEventListener('click', () => {
                this.flip();
            });
            this.initialised = true;
        }
    }

}

// < ========================================================
// < Execution
// < ========================================================

// > Register the custom element as <playing-card> for DOM usage
customElements.define('playing-card', PlayingCard);