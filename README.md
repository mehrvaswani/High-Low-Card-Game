# High-Low-Card-Game

## Overview
The Hi-Lo Card Game presents a player with a card with a value between 1 and 13 (ACE being the lowest, KING being the highest). Players must guess if the next card drawn will be higher or lower in value than the previous card. 

## Requirements
1. Two HTML files (index.html, game.html) and a single CSS files was used to create a front-facing user interface with separate files for each and the cor- responding Javascript file to maintain a level of separation. Classes and IDs were used to link HTML elements to CSS. Note: Please begin the game using the index.html file.
2. Interactions with the deck are fully managed through the Deck of Cards API. Players can (a) generate a full or customise a partial deck (b) draw a top- facing card, and (c) reshuffle the existing deck (if there are any cards remaining), or (d) reshuffle the same deck used in the previous game instead of generating a new one.
3. Players can choose and switch between a full deck or a partial (hearts only) deck and press ’New Game’ to launch a new game or ’Quit Game’ to leave a game anytime.
4. The primary buttons to play are (a) higher and lower to draw a card until there are no more cards in the deck or the player loses (b) skip a turn with only the number of cards drawn increasing without impacting the score (c) shuffle the remaining cards in the existing deck, or (d) ask for a hint to display the probability of the next card being higher or lower.
5. Counts were maintained to track the number of cards drawn, current game score, and highest score across games with a separate function to reset the counts when a new game is launched. Upon refresh, the cards drawn and game scores refresh while the highest score persists due to local storage.
6. Relevant error messages are displayed through window alerts when (a) the player wins or loses (b) asks for a hint (c) quits the game (d) if a deck is empty and the game is over (e) if a deck is shuffled, or (f) if a back-end error has occurred.
