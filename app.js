// Connect Four
// Player 1 and Player 2 alternate turns. On each turn, a piece is dropped down a
// column until a player gets four-in-a-row to win the game. Horizontal, vertical, or diagonal alignments all work. 
// If the board fills with no winner, the game results in a tie. Good luck!

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 0; // active player: 1 or 2
let score = []; //declare score for localStorage
const board = []; // array of rows, each row is array of cells (board[y][x])

// sanity check for board layout
// board = [
//     [ null, null, null, null, null, null, null ],
//     [ null, null, null, null, null, null, null ],
//     [ null, null, null, null, null, null, null ],
//     [ null, null, null, null, null, null, null ],
//     [ null, null, null, null, null, null, null ],
//     [ null, null, null, null, null, null, null ],
//   ];

// declaring global variables
const p1score = document.querySelector('#p1score'); 
const p2score = document.querySelector('#p2score'); 
const startButton = document.querySelector('#start');
const resetButton = document.querySelector('#reset');
const restartButton = document.querySelector('#restart');
const p1turn = document.querySelector('#p1turn');
const p2turn = document.querySelector('#p2turn');

// makeBoard: create in-JS board structure:
// board = array of rows, each row is array of cells  (board[y][x])
function makeBoard() {
  for (let i = 0; i<HEIGHT; i++){
    board[i] = [];
    for (let j = 0; j<WIDTH; j++){
        board[i][j] = null;
      }
  }
}

// make HTML table and row of column tops
function makeHtmlBoard() {
  const htmlBoard = document.querySelector('#board');

//   create a new cell w/ id of 'x' for each WIDTH and append them to the new row w/ id of 'column-top'; append the '#column-top' row to the htmlBoard 
  const top = document.createElement("tr");
  top.classList.add(`player${currPlayer}hover`);
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  htmlBoard.append(top);

//   create a new row for each HEIGHT and new cell w/ id of 'height-width'for each WIDTH; append each cell to its respective row
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

// findSpotForCol: given column x, return top empty y (null if filled)
function findSpotForCol(x) {
  for (let y = HEIGHT-1; y >= 0; y--){
    if (!board[y][x]){
        return y;
    }
  }
  return null;
}

// placeInTable: update DOM to place piece into HTML table of board
function placeInTable(y, x) {
  const bottomCell = document.getElementById(`${y}-${x}`);
  const newDiv = document.createElement('div');
    
  newDiv.classList.add('piece');
  if (currPlayer === 1){
    newDiv.classList.add('p1');
  } else {
    newDiv.classList.add('p2');
  }

  bottomCell.append(newDiv);
}

// endGame: announce game end 
function endGame(msg) {
    if(!alert(msg)){
        location.reload();
    }
}

// handleClick: handle click of column top to play piece
function handleClick(evt) {

  // get x from ID of clicked cell
  let x = +evt.target.id;

  // get next spot in column (if none, ignore click)
  let y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  placeInTable(y, x);
  board[y][x] = currPlayer;


  // check for win, update scores, declare winner
  if (checkForWin()) {
    if (currPlayer == 1){
        score[0] ++;
        p1score.innerHTML = score[0];
        localStorage.setItem('streakP1', score[0]);
    } else {
        score[1] ++;
        p2score.innerHTML = score[1];
        localStorage.setItem('streakP2', score[1]);
    }
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie
  if (checkForTie()) {
    return endGame('The game was a tie! No one wins!')
  }

  //  function that checks to see if all cells are filled
    function checkForTie(){
        const allPieces = document.querySelectorAll('.piece');
        const arr = Array.from(allPieces);
        return arr.length >= 42;
    }

  // switch players
  currPlayer === 1 ? currPlayer = 2 : currPlayer = 1;

  setPlayerTurn();
}

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

    // establish winning arrangements according to piece placement
    // returns true if any of the 4 winning conditions are met
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      let vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      let diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      let diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

// reset button clears localStorage, sets and updates score
resetButton.addEventListener('click',function(e){
    e.preventDefault();
    score = [0,0];
    p1score.innerHTML = score[0];
    p2score.innerHTML = score[1];
    localStorage.clear();
})

// restart button submits empty form, refreshes page
restartButton.addEventListener('click',function(){
    location.reload();
})

// startButton loads game boards and choose Player at random, removes Start Button after
startButton.addEventListener('click',function(){
    makeBoard();
    makeHtmlBoard();
    currPlayer = Math.floor(Math.random()*2)+1;
    setPlayerTurn();
    startButton.remove();
    resetButton.remove();

    const buttons = document.querySelector('#buttons');
    buttons.appendChild(restartButton);
})

// load storage on DOM Load
loadStorage();

// load scores from localStorage
function loadStorage(){
    if (!localStorage.getItem('streakP1') && !localStorage.getItem('streakP1')){
    score = [0,0];
} else if (localStorage.getItem('streakP1') && !localStorage.getItem('streakP2')){
    score[0] = parseInt(localStorage.getItem('streakP1'));
    score[1] = 0;
} else if (!localStorage.getItem('streakP1') && localStorage.getItem('streakP2')){
    score[0] = 0;
    score[1] = parseInt(localStorage.getItem('streakP2'));
} else {
    score[0] = parseInt(localStorage.getItem('streakP1'));
    score[1] = parseInt(localStorage.getItem('streakP2'));
}
    p1score.innerHTML = score[0];
    p2score.innerHTML = score[1];
}

function setPlayerTurn(){
    if (currPlayer === 1){
        p1turn.innerHTML = `It's Player ${currPlayer}'s Turn!`
        p2turn.innerText = 'Player 2';
    }
    if (currPlayer === 2){
        p2turn.innerHTML = `It's Player ${currPlayer}'s Turn!`
        p1turn.innerText = 'Player 1';
    }
}

restartButton.remove();