// < ========================================================
// < Exported Card Class 
// < ========================================================

import { utils } from '../utils.js';
import { SVG } from '../svg.js';
import { Pile } from './pile.js';
import { Player } from '../player.js';

/** 
 * ~ Custom HTMLElement with tagname playing-card  
 * @extends {HTMLElement}  
 */
export class Card extends HTMLElement {

    static instances = [];
    static suits = ['clubs', 'diamonds', 'hearts', 'spades']
    static ranks = [
        '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'
    ];
    static startValues = [30, 0, 1, 2, 3, 40, 20, 10, 60, 4, 5, 6, 50]

    static tagname = 'playing-card';
    static currentID = 0;

    static dragged = null;

    constructor() {
        super();
        this._initialised = false;
        Card.instances.push(this);
    }

    static get observedAttributes() {
        return ['rank', 'suit', 'flipped'];
    }

    /** 
     * ~ Create and return a playing-card HTML element, useful as constructor does not take arguments
     * @param {string | number} rank 
     * @param {string} suit 
     * @param {string} [flipped='false'] 
     * @param {string} [draggable='true'] 
     * @returns {Card}
     * */
    static create(rank, suit, flipped = false) {
        let card = new Card();
        card.rank = rank;
        card.suit = suit;
        card.flipped = flipped;
        card.draggable = true;
        card.id = Card.currentID++
        return card;
    }
    
    static register() {
        customElements.define(this.tagname, this);
        console.log(`Custom element ${this.tagname} registered`);
    }

    get rank() {
        return this.getAttribute('rank');
    }

    set rank(value) {
        this.setAttribute('rank', String(value).toLowerCase());
    }

    get suit() {
        return this.getAttribute('suit');
    }

    set suit(value) {
        this.setAttribute('suit', value.toLowerCase());
    }

    get flipped() {
        return this.getAttribute('flipped') === 'true';
    }

    set flipped(value) {
        this.setAttribute('flipped', value);
    }

    /** @param {boolean | null} flipped */
    flip(flipped = null) {
        let setting = flipped === null ? !this.flipped : flipped;
        this.setAttribute('flipped', setting);
    }

    get identifier() {
        return this.flipped ? 'back' : `${this.rank}_${this.suit}`
    }

    get sortValue() {
        let rankIndex = Card.ranks.indexOf(this.rank);
        return rankIndex;
    }

    get startValue() {
        let rankIndex = Card.ranks.indexOf(this.rank);
        return Card.startValues[rankIndex];
    }

    get pile() {
        let piles = Pile.instances;
        for (let pile of piles) {
            if (pile.contains(this)) {
                return pile;
            }
        }
    }

    get owner() {
        let pile = this.pile;
        let players = Player.instances;
        for (let player of players) {
            if (player.piles.includes(pile)) {
                return player;
            }
        }
    }

    update() {
        this.innerHTML = SVG(this.identifier);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this._initialised && oldValue !== newValue) {
            this.update();
        }
    }

    connectedCallback() {
        this._initialised = true;
        this.update();
    }

}