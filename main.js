// < ========================================================
// < Constants, Variables and Declarations
// < ========================================================

let deck = document.getElementById('deck');
let played = document.getElementById('played');
let discarded = document.getElementById('discarded');
let center = document.getElementById('center');
let suits = ['clubs', 'diamonds', 'hearts', 'spades']
let ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king', 'ace'];

// < ========================================================
// < Utility Functions
// < ========================================================

// < ========================================================
// < Core Functionality
// < ========================================================

// < ========================================================
// < Objects
// < ========================================================

// < ========================================================
// < Document Listeners
// < ========================================================

// > Initialise event listeners
function initListeners() {

    // > Attach anonymous function call to document click event
    document.addEventListener("click", () => {

    });

    // > Attach anonymous function call to document click event
    document.addEventListener("keydown", (e) => {
        if (e.key === ' ') {
            let card = PlayingCard.create('2', 'clubs');
            played.appendChild(card); 
        }
    });

}

// < ========================================================
// < Entry Point
// < ========================================================

// > Entry point of the application
async function main() {
    
    // for (let suit of suits) {
    //     for (let rank of ranks) {
    //         let card = PlayingCard.create(rank, suit);
    //         deck.appendChild(card);
    //     }
    // }
    initListeners();

    /** 
     * @param {HTMLElement} e
     * @param {number} n
     * */
    function add(e, n = 1) {
        for (let i = 0; i < n; i++) {
            const rank = ranks[Math.floor(Math.random() * ranks.length)];
            const suit = suits[Math.floor(Math.random() * suits.length)];
            e.appendChild(PlayingCard.create(rank, suit));
        }
    }

    let hands = document.querySelectorAll('.hand');
    for (let hand of hands) {
        add(hand, 5);
    }

    let piles = document.querySelectorAll('.pile');
    for (let pile of piles) {
        add(pile, 2);
    }

    add(deck, 5);
    add(played, 5);
    add(discarded, 5);

    document.querySelectorAll(".pile").forEach(pile => {

        pile.addEventListener("dragover", (e) => e.preventDefault());
    
        pile.addEventListener("drop", (e) => {
            e.preventDefault();
            const card = draggedCard;
            if (card) {
                pile.appendChild(card);
            }
        });

    });


}

// < ========================================================
// < Execution
// < ========================================================

main();