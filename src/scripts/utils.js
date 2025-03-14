// < ========================================================
// < Exported utils Object
// < ========================================================

export const utils = {

    logging: false,

    /**
     * Sort an array using a key function, with optional reverse
     * 
     * @param {Array<T>} array - The array to sort
     * @param {(item: T) => number} key - Function that returns a numeric sort value
     * @param {boolean} [reverse=false] - Whether to reverse the sort order
     * @returns {Array<T>} - The sorted array
     * @template T
     */
    sort(array, key, reverse = false) {
        return array.sort((a, b) => {
            const comparison = key(a) - key(b);
            return reverse ? -comparison : comparison;
        });
    },

    constrain(x, min, max) {
        return Math.min(Math.max(x, min), max);
    },

    /**
     * Remove an item from an array
     * 
     * @param {Array<T>} array - The array to remove the item from
     * @param {T} item - The item to remove from the array
     * @returns {Array<T>} - The array with the item removed
     * @template T
     */
    remove(array, item) {
        const index = array.indexOf(item);
        if (index !== -1) {
            array.splice(index, 1);
        }
        return array;
    },

    typestring(item) {
        console.log(Object.prototype.toString.call(item))
    },

    logClassName(item) {
        console.log('ClassName: ', item.constructor.name)
    },

    /** 
     * ~ Get a random element from an array
     * @param {Array} arrayA
     * @returns {*} A random element from the array
     */
    choice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /** 
     * > Moves an element to a new container without losing child references
     * @param {HTMLElement} element - The element to move
     * @param {HTMLElement} newParent - The new container
     * @returns {null}
     */
    safemove(element, newParent) {
        const overlays = element.querySelectorAll('element-overlay');
        newParent.appendChild(element);
        overlays.forEach(overlay => element.appendChild(overlay));
    },

    /** 
     * ~ Shuffle an array in place  
     * @param {Array} array - The array to shuffle  
     * @returns {undefined}  
     */
    shuffle(array) {
        let currentIndex = array.length;
        while (currentIndex !== 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
    },

    log(...data) {
        if (utils.logging) {
            console.log(...data)
        }
    },

    warn(...data) {
        if (utils.logging) {
            console.warn(...data)
        }
    },

    error(...data) {
        if (utils.logging) {
            console.error(...data)
        }
    },


    range(func, n = 1) {
        Array.from({ length: n }).forEach(func);
    },

    /**
     * ~ Postpone a callback to the next stack, to avoid JavaScript quirks
     * @param {Function} callback
     * @returns {undefined}
     */
    postpone(callback) {
        setTimeout(callback, 0);
    },


    /**
     * Defer callback to the next event loop iteration, to avoid JavaScript quirks, and return Promise for .then() chaining
     * @param {Function} callback
     * @returns {Promise} Returns a Promise that resolves after the timeout
     */
    defer(callback) {
        return new Promise(resolve => {
            setTimeout(() => {
                callback();
                resolve();
            }, 0);
        });
    },

    /** 
     * ~ Toggle visibility for an element via .hidden class
     * @param {HTMLElement} element
     * @returns {undefined}
     */
    toggleHidden(element, hidden = null) {
        element.classList.toggle('hidden', hidden);
    },

    assert(condition, message) {
        if (!condition) {
            throw new Error(`UserError: ${message}`);
        }
        return true;
    },

    setDragImage(event, element) {
        element.style.zIndex = '999';
        utils.postpone(() => {
            event.dataTransfer.setDragImage(element, 0, 0);
            element.style.zIndex = '';
        })
    }

};