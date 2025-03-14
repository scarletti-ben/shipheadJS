# ShipheadJS

## Overview
A rebuild of my previous project: [`shiphead`](https://github.com/scarletti-ben/shiphead), which was a card game from my childhood built in `Python`, this time built in `JavaScript`


> [!NOTE]  
> The `playing-card` elements resize when they do not fit in `played` div, and have empty space below the bottom of their resized internal `SVG`

> [!IMPORTANT]  
> Crucial information necessary for users to succeed

> [!WARNING]  
> Critical content demanding immediate user attention due to potential risks


# Today
> [!NOTE]  
> All cards generated as a single deck, and given an id based on index in the original deck

> [!IMPORTANT]  
> Learned about typed declarations
```javascript
// < ========================================================
// < Typed Declarations
// < ========================================================

/** @type {HTMLElement[]} */
let pack = [];
```

# TODO
- Fix order / z-index of enemy cards so they display LTR instead or RTL
- Implement played pile pickup button
- Hide cursor when dragging, or move card so it doesn't hide the number
- Animations for card moving
- Hide deck
- Hide opponent cards (toggle via setting)
- Implement settings
- Hide bottom card
- Burn deck to discarded
- Draw card
- Add rules modal

# Ideas
- Modifiers
    - 2 on a 9 burns the deck

# TODO 2
- Inert state changing
- Cleanup drag and drop to functions
- ~~Visible timer when card is played~~
- Play multiple cards (pending cards)
- Play pile cards
- Player class / object
- Hidden cards always valid to play
    - Evaluate card AFTER play - pending system
- "Submit" card
<!-- ! PENDING CARDS -->

- Fix overlay system
- Button to overlay all valid cards
- Make overlay a class

- Wait on 8

# REWRITE

# Information About Overlay Ticker
- Using document.body.contains(overlay) in the grow function you can see that the ticker is still running when you cleanse card overlays, but it just isn't a child of the parent
	- Perhaps a conditional ticker would be useful but for now just noting this behaviour

```javascript
let overlay = Overlay.create(card);
let grow = (progress) => {
	overlay.style.height = (100 * progress) + "%";
	console.log(document.body.contains(overlay));
}
ticker(grow, ms)
	.then((message) => Overlay.cleanse(overlay));    
```

# Aims
- Switch turn
- Computer action
- Show information