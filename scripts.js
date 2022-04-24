/* This JS file defines and holds all the game logic in the form of
variables and functions for user interaction. They are organised in more
or less step-by-step manner*/

/* stores primary API url and deckID obtained from APIs as global variables
for easy reuse and recall across functions. 
Credit to Chase Roberts (@crobertsbmw) for this API.*/
const url = 'http://deckofcardsapi.com/api/deck/';
var deckID;

/* Counts for score, cards drawn, and high score as global variables */
var score = 0;
var cardDrawn = 0;
var highScore = 0;

/* tracks values of previous and current cards drawn as global variables */
var previousCard;
var currentCard;

/* some booleans as global variables to check status of whether a card is higher 
and if a page has been refreshed*/
var higher;
var isRefreshed = false;

/* defines a default deck selection and detects if there has been a switch in deck chosen.
"FD" refers to full deck and "HD" refers to the partial Hearts deck. */
var gameSetting = "FD";
var gameTypeSwitched = false;

/* number of cards in a Full (52 cards) and Partial Hearts Deck (13 cards) 
stored as key-value object stores to track changes in number of cards. 
This is used to calculate the probability the next card 
is higher or lower as a hint for the user*/
let fullDeckCountMap = {
    "ACE": 4,
    "KING": 4,
    "QUEEN": 4,
    "JACK": 4,
    "10": 4,
    "9": 4,
    "8": 4,
    "7": 4,
    "6": 4,
    "5": 4,
    "4": 4,
    "3": 4,
    "2": 4
};

let heartsDeckCountMap = {
    "ACE": 1,
    "KING": 1,
    "QUEEN": 1,
    "JACK": 1,
    "10": 1,
    "9": 1,
    "8": 1,
    "7": 1,
    "6": 1,
    "5": 1,
    "4": 1,
    "3": 1,
    "2": 1
}

/* Initialising function that defines the game play when the page is loaded.
It first checks if the page is a first time page load or a refreshed page and resets
the score and cards drawn accordingly before checking which deck has been selected.
It then maps any user clicks on a button to its corresponding functionality using DOM 
manipulation */
function init() {
    isRefreshed = true;
    resetCount();

    document.getElementById("FD").addEventListener('click', function (event) {
        if (gameSetting === "HD") {
            gameTypeSwitched = true;
        }
        gameSetting = "FD";
    });
    document.getElementById("HD").addEventListener('click', function (event) {
        if (gameSetting === "FD") {
            gameTypeSwitched = true;
        }
        gameSetting = "HD";
    });

    document.getElementById("higher").onclick = onClickHigher;
    document.getElementById("lower").onclick = onClickLower;
    document.getElementById("skip").onclick = drawCard;
    document.getElementById("shuffle").onclick = reshuffleCurrentDeck;
    document.getElementById("newgame").onclick = newGame;
    document.getElementById("quitGame").onclick = quitGame;
    document.getElementById("hint").onclick = getHigherProbability;
}

/* Resets the count for cards drawn and game score and displays them on the interface.
All high scores are persisted in the event of a page refresh */
function resetCount() {
    cardDrawn = 0;
    score = 0;
    document.getElementById("FDguess").innerHTML = cardDrawn;
    document.getElementById("HDguess").innerHTML = cardDrawn;
    document.getElementById("FDscore").innerHTML = score;
    document.getElementById("HDscore").innerHTML = score;
    saveNewScores();
}

/* Based on the deck type selected, makes an API call to retrieve the deck selected
and identifies the deck used by storing the deck ID in a variable.
Async functions ensure the deck ID is stored before it can be used. */
async function getDeck() {
    var response = "";

    if (gameSetting === "FD") {
        deckID = await fetch('http://deckofcardsapi.com/api/deck/new/shuffle/')
            .then(res => res.json())
            .then(data => data.deck_id)
            .catch((error) => {
                console.log(error);
                window.alert("Sorry, something went wrong!");
                return null;
            });
    }
    else {
        deckID = await fetch('http://deckofcardsapi.com/api/deck/new/shuffle/?cards=AH,2H,3H,4H,5H,6H,7H,8H,9H,0H,JH,QH,KH')
            .then(res => res.json())
            .then(data => data.deck_id)
            .catch((error) => {
                console.log(error);
                window.alert("Sorry, something went wrong!");
                return null;
            });
    } return deckID;

}

/* Renders an image of the cards depending on the deck selected. 
The current card is stored as a "previous card" because it is compared against
the next card in the deck which becomes the "current card" when drawn. 
If a user chooses to 'skip' a guess, a card is still drawn without 
an increment to the score but the number of cards draws still increments.*/
async function drawCard() {
    let value;
    let response = await fetch(`${url}${deckID}/draw/?count=1`)
        .then(res => res.json())
        .catch((error) => {
            console.log(error);
            window.alert("Sorry, something went wrong!");
            return null;
        });

    previousCard = currentCard;
    currentCard = response.cards[0].value;

    /* The API generates a deck at a start count of 1.
    If a card is drawn, then it checks what the user has guessed.*/
    if (cardDrawn >= 1) {
        value = isCorrectGuess(currentCard, previousCard);
    } else {
        value = true;
    }

    /* Checks if there are any cards remaining in the deck before rendering an image using DOM.
    If a user has chosen to skip, the next card is displayed. */
    if (response.remaining !== 0 || value) {
        let nextCard = response.cards[0].image;
        //render an image of the card to be displayed to the user
        document.getElementById("top").src = nextCard;

        //Checks which deck is selected and displays the number of guesses as cards drawn to user.
        if (gameSetting === "FD") {
            document.getElementById("FDguess").innerHTML = cardDrawn;
        }

        else if (gameSetting === "HD") {
            document.getElementById("HDguess").innerHTML = cardDrawn;
        }
    }

    //If the deck has no remaining cards, the game is over and the score is displayed.
    //A new game is initiated by default
    else if (response.remaining === 0) {
        window.alert("Deck out of cards! Game Over. \n Your score is " + score + " with a total of " + cardDrawn + " cards drawn.");
        newGame();
    } else {
        console.log("Something went wrong!");
    }

    return;
}

/* Checks if the user has clicked a higher or lower button to submit their guess.
Accordingly it renders a card and measures the value of next card.
A count is kept to check the number of cards drawn. */
function onClickHigher() {
    higher = true;
    drawCard();
    cardDrawn++;
}

function onClickLower() {
    higher = false;
    drawCard();
    cardDrawn++;
}

/* Checks if the user's guess is correct or not by checking the value 
of the currently displayed card and the next card stored.
If the guess is correct, the score increments. */
function isCorrectGuess(currentCard, previousCard) {
    if ((higher && getCardValue(currentCard) > getCardValue(previousCard))
        || (!higher && getCardValue(currentCard) < getCardValue(previousCard))) {
        score++;

        //Displays/updates the score on interface depending on the deck selected
        if (gameSetting === "FD") {
            document.getElementById("FDscore").innerHTML = score;

        }

        else if (gameSetting === "DD") {
            document.getElementById("HDscore").innerHTML = score;
        }

        return true;

    }
    //If a guess is incorrect, the game is over and a message is displayed to the user with their score
    else {
        window.alert("You lost! The next card has a value of " + currentCard + " (" + getCardValue(currentCard) + ") " +
            ".\nYour score is " + score + " with a total of " + cardDrawn + " cards drawn.");
        setHighScore();
        newGame();
        return false;
    }
}

//A function to retrieve the high score from local storage depending on the deck selected
function getHighScore(gameSetting) {
    let i = localStorage.getItem(`high_score_${gameSetting}`);
    return i ? Number(i) : 0;
}

/* Function to set or update the high score by first retrieving the current value.
If a new score is higher than a score from a previous game, it replaces the high score value.*/
function setHighScore() {
    let currentHighScore = getHighScore();
    if (score > currentHighScore) {
        localStorage.setItem(`high_score_${gameSetting}`, score.toString());
        saveNewScores();
    }
}

//An updated score is displayed to the user.
function saveNewScores() {
    document.getElementById("FDhighscore").innerHTML = getHighScore("FD");
    document.getElementById("HDhighscore").innerHTML = getHighScore("HD");
}

/* If a user chooses to shuffle the current deck, there are cards remaining in the deck,
this function leverages the API to manage reshuffling */
async function reshuffleCurrentDeck() {
    let deck = await fetch(`${url}${deckID}/shuffle/?remaining=true`)
        .then(res => res.json())
        .catch((error) => {
            console.log(error);
            window.alert("Sorry, something went wrong!");
            return null;
        });
    window.alert("Deck Reshuffled");
    return deck;
}

/* If a user asks for a hint, the probability the next card is higher/lower is displayed. 
A computation is determined based on the current deck (FD or HD).
The numerator is defined by the sum of cards that are higher/lower than the current one.
The denominator is defined by the number of cards remaining in the deck.
Both values exclude the card currently displayed.  
*/
async function getHigherProbability() {
    let totalCards = await fetch(`${url}${deckID}`)
        .then(res => res.json())
        .catch((error) => {
            console.log(error);
            window.alert("Sorry, something went wrong!");
            return null;
        });

    totalCards = totalCards.remaining;

    let higherSum = 0;
    let lowerSum = 0;

    /* Determine numerator by checking current deck in use.
    Compare the values of current and next card. 
    For probability it is higher, sum to the right.
    For probability it is lower, sum to the left.  */
    if (gameSetting === "FD") {
        Object.keys(fullDeckCountMap).forEach(cardType => {
            if (getCardValue(cardType) > getCardValue(currentCard)) {
                higherSum += fullDeckCountMap[currentCard];
            } else if (getCardValue(cardType) < getCardValue(currentCard)) {
                lowerSum += fullDeckCountMap[currentCard];
            }
        });

    }

    else if (gameSetting === "HD") {
        Object.keys(heartsDeckCountMap).forEach(cardType => {
            if (getCardValue(cardType) > getCardValue(currentCard)) {
                higherSum += heartsDeckCountMap[currentCard];
            } else if (getCardValue(cardType) < getCardValue(currentCard)) {
                lowerSum += heartsDeckCountMap[currentCard];
            }
        });

    }

    //Update the object stores to reduce the existing card
    let oldValue = fullDeckCountMap[currentCard];
    let newValue = oldValue - 1;
    fullDeckCountMap[currentCard] = newValue;

    //Use numerator and total cards remaining to calculate probability
    calculateProbability(higherSum, totalCards);

}

/* Use numerator and total cards remaining to calculate probability
by multiiplying by 100 for a percentage value and round it off to 
two decimal places. Display the results to the user.  */
function calculateProbability(number, totalCards) {

    let higherProbability = Math.round((number / totalCards) * 100);
    let lowerProbability = Math.round(100 - higherProbability);
    window.alert("The probability your next card is higher is " + higherProbability + "%. \nThe probability the next card is lower is " + lowerProbability + "%.");

}

//Called when user chooses to start a new game
async function newGame() {
    resetCount();

    //If a page is refreshed, generate a new deck
    if (isRefreshed) {
        await getDeck();
    }

    //If a user chooses/toggles to another deck type, generate a new deck according to type
    else {
        if (gameTypeSwitched) {
            await getDeck();
            gameTypeSwitched = false;
        }

        /* If user simply chooses new game without refreshing, shuffle previously used deck
        insted of generating a new one  */
        let shuffled = await fetch(`${url}${deckID}/shuffle/`)
            .catch((error) => {
                console.log(error);
                window.alert("Sorry, something went wrong!");
                return null;
            });
        cardDrawn = 0;
    }

    //Render new card and display main game container
    await drawCard();
    let gameContainer = document.getElementById("Container");
    gameContainer.style.display = "block";
    isRefreshed = false;
}

//Removes the display of main game container when a user quits
async function quitGame() {
    let gameContainer = document.getElementById("Container");
    gameContainer.style.display = "none";
    window.alert("We're sorry to see you go! \nYour score is " + score + " with a total of " + cardDrawn + " cards drawn.");
}

//Function to map the value of the card obtained from API against a numerical value for the game
function getCardValue(cardSymbol) {

    switch (cardSymbol) {

        case "ACE":
            return 1;
        case "2":
            return 2;
        case "3":
            return 3;
        case "4":
            return 4;
        case "5":
            return 5;
        case "6":
            return 6;
        case "7":
            return 7;
        case "8":
            return 8;
        case "9":
            return 9;
        case "10":
            return 10;
        case "JACK":
            return 11;
        case "QUEEN":
            return 12;
        case "KING":
            return 13;
        default:
            console.log("Error! Incorrect card!");
            return false;
    }
}

//Initialises game upon window load.
window.onload = init();
