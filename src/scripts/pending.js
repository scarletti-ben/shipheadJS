// < ========================================================
// < Imports
// < ========================================================

import { utils } from "./utils.js";
import { Card } from "./custom-elements/card.js";

// < ========================================================
// < Exported Pending Singleton
// < ========================================================

export class Pending {
    
    /** @type {Card[]} */
    static cards = [];
    
    static duration = 2000;
    static slower = 0.2;
    static faster = 1;
    static timer = null;

    static timeout(ms) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.process(), ms);
    }

    static process() {
        this.cards = [];
        this.timer = null;
        
        console.log('Pending.process: cleared cards and reset timer');
    }
}