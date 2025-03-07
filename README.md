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
- Implement drag and drop system
    - Contextually aware and handles card validity
    - Colour piles when dragging / hover over
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
- Review python code for ideas
- Conditional for dragging

- Perhaps give card more info about itself

- Condition to drag a card from hand
    - Is it your turn

- Condition to drag a card from your face up
    - Is it your turn
    - Do you have no hand

- Condition to drag a card from your face down
    - Is it your turn
    - Do you have no hand
    - Do you have no face up



- Need an information window with toggles