
PENDING = []

def check_four_in_a_row(cards):
    """Check if four cards in a row are same row, discard 7s if needed"""
    
    def four_in_a_row(cards):
        """Check if all cards in a set are the same rank"""
        result = False
        if len(cards) >= 4:
            top_four = cards[-4:]
            result = len(set(card.rank for card in top_four)) == 1
        return result
    
    result = False
    if four_in_a_row(cards):
        result = True
    else:
        cards = [card for card in cards if card.rank != 7]
        result = four_in_a_row(cards)
    return result

def check_for_rank(cards, rank):
    """Check if there is a specific rank at the top of the pile"""
    if cards:
        top_card = cards[-1]
        if top_card.rank == rank:
            return True
        
def check_for_rank_any(cards, rank, pending = None):
    """Check if any of a rank exist in a given set of cards"""
    cards = [card for card in cards if card is not None]
    if pending:
        cards = [card for card in cards if card not in pending]
    return any(card.rank == rank for card in cards)

def check_burned(cards):
    """Check for a 10 or a four in a row"""
    if check_for_rank(cards, 10):
        print('10 burns the deck, take another turn')
        return True
    else:
        if check_four_in_a_row(cards):
            print('Four in a row burns the deck, take another turn')
            return True
        
def get_pending_rank():
    """Get the current rank of pending cards"""
    rank = None
    if PENDING:
        rank = PENDING[0].rank
    return rank

while True:

    TABLE_RANK = get_table_rank()
    VALID_RANKS = []    
    ACTIVE_PILE = ACTIVE_PLAYER.pile()
    RESERVED = [card for card in PENDING + [HELD] if card is not None]
    TABLE_CARD = get_table_card()
    TABLE_RECTANGLE = get_pile_rectangle()
    PENDING_RANK = get_pending_rank()
    PILE_HOVERED = TABLE_RECTANGLE.collidepoint(mouse) and not HELD

    align_sort_blit()
    draw_held()

    if ACTIVE_PLAYER is PLAYER_TWO and not PENDING:
        cards = [card for card in ACTIVE_PILE.cards if card is not None and card not in RESERVED]
        valid = lambda card: card.rank in VALID_RANKS
        no_valid = not any(valid(card) for card in cards)
        if not PENDING:
            valid_cards = [card for card in cards if valid(card)]
        else:
            valid_cards = [card for card in cards if card.rank == PENDING[0].rank]

        eight_or_wait = TABLE_ACTIVE and check_for_rank(PILE, 8)
        if ACTIVE_PILE.hidden:
            print('--- AI ---')
            print('AI has chosen a blind card at random')
            card = random.choice(cards)
            PENDING.append(card)
        elif no_valid:
            if not eight_or_wait:
                print('--- AI ---')
                print('AI has no valid cards and must pick up')
                pickup(PLAYER_TWO)
            else:
                print('--- AI ---')
                print('AI has no 8 and chooses to wait')
                skip_turn()
        else:
            if timer.counter == 0:
                print('--- AI ---')
                print('AI has chosen a valid card at random')
                card = random.choice(valid_cards)
                PENDING.append(card)

    for event in events:
        handle_quit(event)
        if left_mouse_down(event):
            if HIGHLIGHTED:
                HELD = HIGHLIGHTED
        elif left_mouse_up(event):
            if HELD:
                process_held()
            HELD = None
            HIGHLIGHTED = None
        
        if right_mouse_up(event):
            if PILE:
                if not PENDING:
                    pickup(ACTIVE_PLAYER)
                else:
                    print('\n --- ERROR ---')
                    print('You cannot pickup with valid pending cards')
            else:
                print('\n --- ERROR ---')
                print('There are no cards to pick up')
        
        if key_down(event):
            if event.key == pygame.K_EQUALS:
                PLAYER_ONE.blind.cards.append(None)
                PLAYER_ONE.shown.cards.append(
                    Card(images, 'spades', 6, symbols, ranks, sort_values, start_values))
            if event.key == pygame.K_7:
                print('--- ACTIVE ---')
                print(f'Table Active: {TABLE_ACTIVE}')
            if event.key == pygame.K_r:
                start(PLAYERS, STACKS)
                DECK.clear()
            elif event.key == pygame.K_SPACE:
                if PILE:
                    if not PENDING:
                        pickup(ACTIVE_PLAYER)
                    else:
                        print('\n --- ERROR ---')
                        print('You cannot pickup with valid pending cards')
                else:
                    print('\n --- ERROR ---')
                    print('There are no cards to pick up')
            elif event.key == pygame.K_BACKSPACE:
                if PENDING:
                    PENDING.clear()
                    HELD = None
                    HIGHLIGHTED = None
                    print('\n --- CANCEL ---')
                    print('Pending cards cleared')
                else:
                    print('\n --- ERROR ---')
                    print('There are no pending cards to cancel')
    
    eight_or_wait = TABLE_ACTIVE and check_for_rank(PILE, 8)
    
    if PENDING or eight_or_wait:
        if eight_or_wait and not PENDING:
            if check_for_rank_any(ACTIVE_PILE.cards, 8) and not ACTIVE_PILE.hidden and ACTIVE_PLAYER is not PLAYER_TWO:
                timer.count(0.5)
            else:
                timer.count(4)
        else:
            if check_for_rank_any(ACTIVE_PILE.cards, PENDING_RANK, PENDING) and not ACTIVE_PILE.hidden and ACTIVE_PLAYER is not PLAYER_TWO:
                timer.count(1)
            else:
                timer.count(4)
    else: 
        timer.reset()
    if timer.complete:               
        if eight_or_wait and not PENDING:
            skip_turn()
        else:
            end_timer()

    pygame.display.flip()	
    clock.tick(FPS)