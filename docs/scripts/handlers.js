// < ========================================================
// < Imports
// < ========================================================

import { utils } from './utils.js';
import { Card } from './custom-elements/card.js';
import { Pending } from './pending.js';
import { Game } from './game.js';
import { Overlay } from './custom-elements/overlay.js';

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

        console.log(`dragstart: event handling ${event}`);

        let card = event.target.closest("playing-card");

        utils.log(`dragstart: closest card ${card?.rank}`);

        if (!card) {
            event.preventDefault();
            utils.log(`dragstart: no card found, prevented default`);
            return;
        }

        // > Ensure that the dragged card is elligible to be picked up
        if (!Game.player.elligibleCards.includes(card)) {
            console.warn('cannot drag, this card is not in elligibleCards');
            event.preventDefault();
            return;
        }

        Card.dragged = card;


        if (Game.accepts(card)) {
            utils.log(`dragstart: Game.accepts passed`);
            Overlay.create(center);

        } else {
            utils.log(`dragstart: Game.accepts card failed`);
        }

        utils.setDragImage(event, card);
        utils.postpone(() => utils.toggleHidden(card, true));

        utils.log(`dragstart: setDragImage called`);
        utils.log(`dragstart: reached end of function`)

    },

    drop(event) {

        console.log(`drop: event handling ${event}`)

        let center = event.target.closest("#center");
        if (!center) {
            event.preventDefault();
            return;
        }

        let card = Card.dragged;
        let accepted = Game.accepts(card);

        if (accepted) {

            utils.log(`drop: cleansing all Pending.cards of overlays`);
            for (let x of Pending.cards) {
                Overlay.cleanse(x);
            }

            // If card in player hidden, morePossible = false;
            
            // POSTIT - THIS IS THE HASMORE CHECK
            let source = card.pile;
            let quantity = source.numberOf(card.rank);

            // POSTIT - GET PILENAME?

            window.center.add(card, false);

            // POSTIT - CHECK THIS HASMORE CHECK FOR IF IT IS CHECKING PILE AS GROUPING OF TWO GROUND CARDS, instead of across the three
            let speed = quantity > 1 ? Pending.slower : Pending.faster;
            let ms = Pending.duration / speed;

            Pending.cards.push(card);

            utils.log(`drop: creating all Pending.cards overlays`);
            for (let card of Pending.cards) {
                let overlay = Overlay.create(card);
                let grow = (progress) => {
                    overlay.style.height = (100 * progress) + "%";
                    // console.log(document.body.contains(overlay));
                }
                utils.ticker(grow, ms)
                    .then((message) => Overlay.cleanse(overlay));
            }

            Pending.timeout(ms);

        }
        else {
            utils.log(`drop: cannot play rank ${card.rank}`)
        }

        utils.log(`drop: reached end of function`)

    },

    dragend(event) {

        console.warn(`dragend: event handling ${event}`)

        let dragged = Card.dragged;
        if (dragged) {
            utils.log(`dragend: toggling hidden to false for ${dragged}`)
            utils.toggleHidden(Card.dragged, false);
        }
        Card.dragged = null;

        utils.log(`dragend: calling overlay cleanse for center (${center})`)
        Overlay.cleanse(center);

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
    }

};