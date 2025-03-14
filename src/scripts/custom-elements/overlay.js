// < ========================================================
// < Imports
// < ========================================================

import { utils } from "../utils.js";

// < ========================================================
// < Exported Overlay Class
// < ========================================================

/** 
 * Custom HTMLElement < element-overlay >
 * @extends {HTMLElement}  
 */
export class Overlay extends HTMLElement {
    static tagName = 'element-overlay';
    static defaultSettings = {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(128, 0, 128, 0.5)',
        pointerEvents: 'none'
    };

    static objects = [];

    constructor() {
        super();
        this._connected = null;
        this._parent = null;
        this._task = null;
    }

    /**
     * @param {HTMLElement} parent
     * @param {number} ms
     * @param {(overlay: Overlay, decimal: number) => void} func - A function to be derived from
     */
    static create(parent) {
        let overlay = new Overlay();
        parent.appendChild(overlay);
        overlay._parent = parent;
        Object.assign(overlay.style, Overlay.defaultSettings);
        Overlay.objects.push(overlay);
        return overlay;
    }

    static hasDirectOverlay(item) {
        if (!item instanceof HTMLElement) {
            console.log('Overlay.hasOverlay: item is not an instance of HTMLElement');
            return false;
        }
        else {
            let overlays = Array.from(item.children).filter(child => child.tagName.toLowerCase() === 'element-overlay');
            return overlays.length > 0;
        }

    }

    static isOverlay(element) {
        return element instanceof HTMLElement && element.tagName.toLowerCase() === 'element-overlay';
    }

    static cleanse(item) {
        if (Overlay.isOverlay(item)) {
            utils.log('Overlay.cleanse this item is an element-overlay');
            item.remove();
            utils.log('Overlay.cleanse removing overlay as element');
        } else if (Overlay.hasDirectOverlay(item)) {
            utils.log('Overlay.cleanse this item has an element-overlay');
            let overlays = Array.from(item.children).filter(child => child.tagName.toLowerCase() === 'element-overlay');
            item.removeChild(overlays[0]);
            utils.warn('Overlay.cleanse removing overlay as child');
        } else {
            utils.warn('Overlay.cleanse: item is not an overlay and does not have overlay')
        }
    }

    static get observedAttributes() {
        return [];
    }

    static register() {
        customElements.define(this.tagName, this);
        console.log(`Custom element ${this.tagName} registered`);
    }

    connectedCallback() {
        if (this._connected) {
            console.warn('Overlay instance reconnected')
            setTimeout(() => {
                if (!this._parent.contains(this)) {
                    this._parent.appendChild(this);
                }
            }, 0);
            return;
        }
        this._connected = true;
        utils.log('Overlay instance connected')
    }

    disconnectedCallback() {
        utils.log('Overlay instance disconnected')
    }

}