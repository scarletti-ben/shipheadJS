// < ========================================================
// < Imports
// < ========================================================

import { utils } from './utils.js';
import { Card } from './custom-elements/card.js';
import { Pending } from './pending.js';
import { Game } from './game.js';
import { Overlay } from './custom-elements/overlay.js';

// < ========================================================
// < Queries for HTML Elements
// < ========================================================

let information = document.getElementById('information')

// < ========================================================
// < Exported handlers Object
// < ========================================================

export const handlers = {

    mx: 0,
    my: 0,

    mousemove(event) {
        handlers.mx = event.clientX;
        handlers.my = event.clientY;
    },

    suppress(event) {
        event.preventDefault();
    },

    keydown(event) {
        let element = document.elementFromPoint(handlers.mx, handlers.my);
        let closest = element.closest('playing-card');
        let key = event.key.toLowerCase();
        if (closest) {
            let card = closest;
            const keyMap = {
                '1': 'ace',
                '2': '2',
                '3': '3',
                '4': '4',
                '5': '5',
                '6': '6',
                '7': '7',
                '8': '8',
                '9': '9',
                '0': '10',
                'j': 'jack',
                'q': 'queen',
                'k': 'king',
                'a': 'ace',
            };
            if (key in keyMap) {
                card.rank = keyMap[key]
            }
            else if (key === 's') {
                let choices = Card.suits.filter(suit => !(suit === card.suit));
                card.suit = utils.choice(choices);
            }
            else if (key === 'f') {
                card.flip();
            }
            else if (key === 'delete') {
                burned.add(card);
            }
            else if (key === 'enter') {
                Game.player.hand.add(card, Game.player.flips);
            }
            else if (key === 'x') {
                console.error('YOU HAVE PRESSED X ON A CARD AGAIN')
            }

        } else {
            if (key === 'x') {
                Game.player.act();
            } else if (key === 'i') {
                utils.toggleHidden(information);
            } else if (key === 'd') {
                utils.logger.download();
            } else if (key === 'b') {
                let container = document.getElementById('button-container');
                utils.toggleHidden(container);
            }            
        }
    },

    // ! ========================================================
    // ! EXPERIMENTAL
    // ! ========================================================

    dragstart(event) {
        // console.warn(`dragstart: event handling ${event}`);
        let card = event.target.closest("playing-card");

        if (!card) return handlers.suppress(event);

        let available = Game.player.availableCards;

        // > Ensure that the dragged card is available to be picked up
        if (!available.includes(card)) {
            console.error('cannot drag, this card is not in availableCards');
            return handlers.suppress(event);
        }

        // POSTIT
        if (Game.player.blind.includes(card) && Pending.cards.length > 0) {
            console.error('cannot drag, only one card from blind');
            return handlers.suppress(event);
        }

        Card.dragged = card;
        if (Game.accepts(card)) {
            Overlay.create(center);
        }

        utils.setDragImage(event, card);
        utils.postpone(() => utils.toggleHidden(card, true));

    },

    drop(event) {
        // console.warn(`drop: event handling ${event}`);
        let center = event.target.closest("#center");
        if (!center) return handlers.suppress(event);
        let card = Card.dragged;
        if (Game.accepts(card)) {
            let source = card.pile;

            // POSTIT
            if (Game.player.blindCards.includes(card)) {
                console.error('yee');
            }

            // POSTIT
            let quantity = source.numberOf(card.rank);

            let speed = quantity > 1 ? Pending.slower : Pending.faster;
            let ms = Pending.duration / speed;
            Pending.submit(card, card.owner, true, ms);
        }
    },

    dragend(event) {
        // console.warn(`dragend: event handling ${event}`);
        let dragged = Card.dragged;
        if (dragged) {
            // utils.log(`dragend: toggling hidden to false for ${dragged}`);
            utils.toggleHidden(Card.dragged, false);
        }
        Card.dragged = null;
        Overlay.cleanse(center);
        // utils.log(`dragend: called overlay cleanse for center (${center})`)
    },

    // > ========================================================
    // > Initialisation Method
    // > ========================================================

    init() {
        document.addEventListener("mousemove", handlers.mousemove);
        document.addEventListener("dragstart", handlers.dragstart);
        document.addEventListener("drop", handlers.drop);
        document.addEventListener("dragend", handlers.dragend);
        document.addEventListener("dragover", handlers.suppress);
        document.addEventListener("dragenter", handlers.suppress);
        document.addEventListener("keydown", handlers.keydown);
        information.addEventListener("click", () => utils.toggleHidden(information, true));
    }

};