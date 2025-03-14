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

/**
 * @param {(progress: number) => void} callback - A function that takes accepts ticker progress (0 to 1) as an argument
 * @param {number} duration - The duration in milliseconds for the ticker to run for
 * @returns {Promise<string>} A promise that resolves when the ticker is finished, outputting string message
 */
function ticker(callback, duration) {
    return new Promise((resolve) => {
        let start = performance.now();
        function tick() {
            let current = performance.now();
            let elapsed = current - start;
            let progress = Math.min(elapsed / duration, 1);
            callback(progress);
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                resolve('ticker finished');
            }
        }
        requestAnimationFrame(tick);
    });
}

export const handlers = {

    mx: 0,
    my: 0,

    mousemove(event) {
        handlers.mx = event.clientX;
        handlers.my = event.clientY;
    },

    dragstart(event) {

        console.log(`dragstart: event handling ${event}`);

        let card = event.target.closest("playing-card");

        utils.log(`dragstart: closest card ${card?.rank}`);

        if (!card) {
            event.preventDefault();
            utils.log(`dragstart: no card found, prevented default`);
            return;
        }

        Card.dragged = card;

        utils.log(`dragstart: cleansing center`);
        Overlay.cleanse(center);

        if (Game.accepts(card)) {
            utils.log(`dragstart: Game.accepts passed`);
            let overlay = Overlay.create(center);

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

        utils.log(`drop: closest center ${center}`);

        if (!center) {
            event.preventDefault();
            utils.log(`drop: not above center, prevent default`)
            return;
        }

        let card = Card.dragged;

        let accepted = Game.accepts(card);
        let flipped = card.flipped;
        let result = flipped || accepted;

        utils.log(`drop: accepted is ${accepted} flipped is ${flipped} => result is ${result}`)

        if (result) {

            utils.log(`drop: cleansing all Pending.cards of overlays`);
            for (let x of Pending.cards) {
                Overlay.cleanse(x);
            }

            let source = card.pile;
            let quantity = source.numberOf(card.rank);
            window.center.add(card);
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
                ticker(grow, ms)
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

        utils.log(`dragend: drag state is ${dragged}`)

        if (dragged) {
            utils.log(`dragend: toggling hidden to false for ${dragged}`)
            utils.toggleHidden(Card.dragged, false);
        }

        Card.dragged = null;

        utils.log(`dragend: dragged card cleared, now ${Card.dragged}`)

        utils.log(`dragend: calling overlay cleanse for center (${center})`)
        Overlay.cleanse(center);

        utils.log(`dragend: reached end of function`)

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
        } else {
            if (key === 'x') {
                Game.player.act()
            }
        }
    },

    suppress(event) {
        event.preventDefault();
    },

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