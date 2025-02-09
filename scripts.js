// use these??
ERROR = 0;
SUCCESS = 1;

// create gameBoard using IIFE
const gameBoard = (function(){
  
  // 3x3 for now
  // 0 empty, 1 and 2 are players
  const board =  [
    [0,0,0],
    [0,0,0],
    [0,0,0],
  ];
  
  // toggles
  let whosTurn = 1;

  const resetGameBoard = () => {
    // dont reset user...let next player go first
    board.map( r => r.fill(0) );
    console.log(board);
  }

  const isSquareAvailable = (row,col) => !board[row][col];
  
  const getCurrentPlayer = () => whosTurn;

  const markSquareByIndex = (index, player = whosTurn) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return markSquare(row,col,player);
  }

  const markSquare = (row,col,player) => {
    
    if (player != whosTurn) {
      console.log("It's not your turn!")
      return ERROR;
    }
    
    if (!isSquareAvailable(row,col)) {
      console.log("That square is not available!")
      return ERROR;
    };
    
    board[row][col] = whosTurn;
    whosTurn = (whosTurn==1) ? 2 : 1;
    return SUCCESS;
  }
  
  //// look for at least one zero
  //const getBoardStatus = () => board.flat().some( x => x==0 );
  
  // look for three in a row
  const getGameStatus = function() {
    
    //lots of good solutions here...
    //https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
    function transpose(matrix) {
      return matrix[0].map((col, i) => matrix.map(row => row[i]));
    }

    let winnerFound;
    
    // winner along row
    winnerFound = 1 == board.filter( row => row.every( x => x==1) || row.every( x => x==2) ).length
    if (winnerFound){
        return true;
    }
    
    // winner along column
    winnerFound = 1 == transpose(board).filter( row => row.every( x => x==1) || row.every( x => x==2) ).length
    if (winnerFound){
        return true;
    }
    
    // winner along main diagonal
    let diagonal = [];
    for (let i = 0; i < board.length; i++) {
      diagonal.push(board[i][i]);
    }
    winnerFound = diagonal.every( x => x==1) || diagonal.every( x => x==2)
    if (winnerFound){
      return true;
    }
    
    // winner along other diagonal
    diagonal = [];
    for (let i = 0; i < board.length; i++) {
      diagonal.push(board[board.length-1-i][i]);
    }
    winnerFound = diagonal.every( x => x==1) || diagonal.every( x => x==2)
    if (winnerFound){
      return true;
    }
    
    // no winner
    return false;

  }
  
  const getBoardState = () => board;
  
  return { 
    markSquare, 
    markSquareByIndex, 
    resetGameBoard, 
    getCurrentPlayer, 
    getGameStatus, 
    getBoardState };

})() /* don't forget to include () to invoke the function */

// function player(name, marker){
//   return {name, marker}
// }

function lockGameBoard(){
  const container = document.querySelector("#gameboard");
  Array.from(container.children).forEach( gamespace => {
    gamespace.removeEventListener('click', handleGameSpaceClick )});
}

function resetGameBoard(){
  const container = document.querySelector("#gameboard");
  gameBoard.resetGameBoard();
  Array.from(container.children).forEach( gamespace => {
    gamespace.style.background='white'});
}

function handleGameSpaceClick(event){
  const gameSpace = event.target;
  const container = document.querySelector("#gameboard");
  index = Array.from(container.children).indexOf(gameSpace);
  
  let currentPlayer = gameBoard.getCurrentPlayer();
  if( gameBoard.markSquareByIndex(index), gameSpace ){
    gameSpace.style.background = (currentPlayer==1) ? 'red' : 'blue';
    if( gameBoard.getGameStatus() ){
      setTimeout(() => {
        result = confirm('Winner! Play again?');
        if (result) {
          resetGameBoard();
        } else {
          lockGameBoard();
        }  
      }, 0); // delay of 0ms seems to be sufficient to update square before prompting user
    }
  };
}

if (document){
  
  // run when DOM is loaded...
  document.addEventListener('DOMContentLoaded', function() {
    
    const container = document.querySelector("#gameboard");
    Array.from(container.children).forEach( (gamespace,index) => {
      gamespace.addEventListener('click', handleGameSpaceClick)
    })
  })

} else {
  
  // https://nodejs.org/en/learn/command-line/accept-input-from-the-command-line-in-nodejs
  const readline = require('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  // READ THIS ABOUT nodejs readline not blocking:
  // THUS cannot use a while loop like you could in python or idl
  //https://stackoverflow.com/questions/23044429/block-for-stdin-in-node-js
  
  function playGame(player = 1){
    
    console.log( gameBoard.getBoardState() );
  
    rl.question(`Player ${player} enter comma-separated row,col pair: `, dat => {
      
      const [row,col] = dat.split(',');
      
      if( ERROR==gameBoard.markSquare(row,col,player)){
        playGame(player);
      };
      
      if (gameBoard.getGameStatus()) {
        console.log(`Player ${player} wins!`);
        console.log( gameBoard.getBoardState() );
        rl.close();
      } else {
        let next_player = (player==1) ? 2 : 1; 
        playGame(next_player);
      };
    });
   
  };
  
  playGame();

}