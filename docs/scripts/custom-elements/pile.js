// < ========================================================
// < Imports
// < ========================================================

import { utils } from '../utils.js';
import { Card } from './card.js';

// < ========================================================
// < Exported Pile Custom Element <card-pile>
// < ========================================================

/** 
 * Custom HTMLElement < card-pile >
 * @extends {HTMLElement}  
 */
export class Pile extends HTMLElement {
    static tagName = 'card-pile';

    /** @type {Pile[]} */
    static instances = [];

    constructor() {
        super();
        Pile.instances.push(this);
    }

    /** @returns {Card[]} */
    get cards() {
        let nodes = this.querySelectorAll('playing-card');
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

    get length() {
        return this.cards.length;
    }

    get top() {
        let elements = this.querySelectorAll('playing-card');
        return elements[elements.length - 1];
    }

    pop() {
        let elements = this.querySelectorAll('playing-card');
        let element = elements[elements.length - 1];
        element.remove()
        return element;
    }

    numberOf(rank) {
        return this.cards.filter(card => card.rank === String(rank)).length;
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

    remove(card) {
        if (card && this.contains(card)) {
            this.removeChild(card);
        }
    }

    static create(id) {
        let pile = new Pile();
        let placeholder = document.getElementById(`placeholder-${id}`);
        placeholder.replaceWith(pile);
        pile.id = id;
        return pile;
    }

    add(card, flipped = null) {
        if (flipped !== null) {
            card.flip(flipped);
        }
        this.appendChild(card);
    }

    static get observedAttributes() {
        return [];
    }

    shuffle() {
        let cards = this.cards;
        utils.shuffle(cards);
        for (let card of cards) {
            this.add(card);
        }
    }

    sort() {
        const cards = this.cards;
        utils.sort(cards, card => card.sortValue);
        cards.forEach(card => this.add(card));
        // const frag = document.createDocumentFragment();
        // cards.forEach(card => frag.appendChild(card));
        // this.replaceChildren(frag);
    }

    connectedCallback() {
        // utils.postpone(() => console.log(`Instance of ${this.tagName.toLowerCase()} added to DOM [${this.id}]`));
    }

    static register() {
        customElements.define(this.tagName, this);
        console.log(`Custom element ${this.tagName} registered`);
    }

}