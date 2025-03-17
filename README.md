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


> [!IMPORTANT]
- Overlays in utils.ticker .then pattern still exist, even when cleansed, until the end of their original ticker, they just aren't in the DOM structure, do with that information as you will












Things i keep needing
- Top card in the pile
- Top rank in the pile
- Anchor card in the pile
- Anchor rank in the pile
- Is the top rank a certain rank
- Is the anchor rank a certain rank
- Is a card a certain rank
- Is a card the same rank as the top card
- Is a card the same rank as the anchor card
- Who owns a card
- Who is the current player
- Which player did a card come from
- Which pile did a card come from
- Is a card playable

Things that may be useful
- Current in a row check, eg returns 3 6s in a row
- player.owns(card)
- player.remaining or player.quantity
- player.haswon (if pending empty)
- player.grounded
- Making shown and hidden just be piles that align ltr instead of left middle right
- Player.is object with attributes to clean namespace
- Game.transfer with clear logging of card movements, contextually aware of where something came from, and where it is going

> [!IMPORTANT]
- Show and hidden piles instead of left middle right

# Custom HTML Elements

## Card
- Class definition in the `JavaScript` is `class Card extends HTMLElement`
- Static property: `Card.instances`
`attributeChangedCallback(name, oldValue, newValue)`
`connectedCallback()`
`disconnectedCallback()`
`customElements.define('playing-card', Card);`
`static get observedAttributes`
- Example in the DOM is `<playing-card rank='ace' suit='spades' flipped='true'></playing-card>`

### Card Instance Attributes / Getters
`card.rank`
`card.suit`
`card.flipped`
`card.pile`
`card.owner`
`card.identifier`

### Card Instance Methods
`card.flip(flipped = null)`
`card.update()`
`card.create(rank, suit, flipped)`

## Player
- Class definition: `class Player`
- Static property: `Player.instances`

### Player Instance Attributes / Getters
- `player.name`
- `player.value`
- `player.flips`
- `player.hand`
- `player.left`
- `player.middle`
- `player.right`
- `player.piles`
- `player.tablePiles`
- `player.handCards`
- `player.tableCards`
- `player.shownCards`
- `player.hiddenCards`
- `player.availableCards`
- `player.isCurrentPlayer`

### Player Instance Methods
- `player.wait()`
- `player.pickup()`
- `player.hasWon()`
- `player.notice(text)`
- `player.refill()`
- `player.canPlay()`
- `player.getValidActions()`
- `player.act(delay = 350)`


## Overlay
- Class definition: `class Overlay extends HTMLElement`
- Static property:  
  - `Overlay.tagName`
  - `Overlay.defaultSettings`
  - `Overlay.instances`

### Overlay Instance Attributes
- `overlay._connected`
- `overlay._parent`
- `overlay._task`

### Overlay Static Methods
- `Overlay.create(parent)`
- `Overlay.hasDirectOverlay(item)`
- `Overlay.isOverlay(element)`
- `Overlay.cleanse(item)`
- `Overlay.get observedAttributes`
- `Overlay.register()`

### Overlay Instance Methods
- `overlay.connectedCallback()`
- `overlay.disconnectedCallback()`

# Game
A zero instance class with a static init, used to hold a great deal of the "game logic" and interactions between different modules / instances / objects within the game.

# Handlers
# Utils