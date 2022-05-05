import React, {useEffect, useState} from 'react';
import { randomIntFromInterval, useInterval } from './utility.js';
import './Board.css';
import Scoreboard from './Scoreboard.js';
import User from './User.js';
import { publicRequest } from './apiHandle.js';

class LinkedListNode {
  constructor(value) {
    this.value=value;
    this.next=null
  }
}

class LinkedList {
  constructor(value) {
    const node=new LinkedListNode(value)
    this.head=node;
    this.tail=node
  }
}

const Direction={
  UP:'UP',
  RIGHT:'RIGHT',
  DOWN:'DOWN',
  LEFT:'LEFT'
};

const boardSize=15;

const getStartingSnakeLLValue=board=>{
  const rowSize=board.length;
  const colSize=board[0].length;
  const startingRow=Math.round(rowSize/3)
  const startingCol=Math.round(colSize/3)
  const startingCell=board[startingRow][startingCol];
  return{
    row:startingRow,
    col:startingCol,
    cell:startingCell,
  };
};

const Board=()=>{
  const [score,setScore]=useState(0)
  const [board,setBoard]=useState(createBoard(boardSize))
  const [snake,setSnake]=useState(new LinkedList(getStartingSnakeLLValue(board)))
  const [snakeCells,setSnakeCells]=useState(new Set([snake.head.value.cell]))
  const [foodCell,setFoodCell]=useState(snake.head.value.cell+5)
  const [direction,setDirection]=useState()
  const [gameover,setGameover]=useState(false)
  const [scoreboard,setScoreboard]=useState([])

  const[easy,setEasy]=useState(200)
  const[normal,setNormal]=useState(120)
  const[hard,setHard]=useState(70)

  const[difficulty,setDifficulty]=useState()


  useEffect(()=>{
    window.addEventListener('keydown',e=>{
      handleKeydown(e)
    })
  },[])

  useInterval(()=>{
    moveSnake()
  },difficulty || normal)

  const handleKeydown=e=>{
    const newDirection=getDirectionFromKey(e.key)
    const isValidDirection=newDirection!=='';
    if(!isValidDirection) return;
    const snakeWillRunIntoItself=getOppositeDirection(newDirection)===direction && snakeCells.size>1;
    if(snakeWillRunIntoItself) return;
    setDirection(newDirection)
  };

  const moveSnake=()=>{
    const currentHeadCoords={
      row:snake.head.value.row,
      col:snake.head.value.col,
    };


    const nextHeadCoords=getCoordsInDirection(currentHeadCoords,direction)
    if(isOutOfBounds(nextHeadCoords,board)){
      handleGameOver()
      return;
    }
    const nextHeadCell=board[nextHeadCoords.row][nextHeadCoords.col];
    if(snakeCells.has(nextHeadCell)){
      handleGameOver()
      return;
    }
 
    const newHead=new LinkedListNode({
      row:nextHeadCoords.row,
      col:nextHeadCoords.col,
      cell:nextHeadCell,
    })
    const currentHead=snake.head;
    snake.head=newHead;
    currentHead.next=newHead;

    const newSnakeCells=new Set(snakeCells)
    newSnakeCells.delete(snake.tail.value.cell)
    newSnakeCells.add(nextHeadCell)

    snake.tail=snake.tail.next;
    if(snake.tail===null){
      snake.tail=snake.head;
    }

    const foodConsumed=nextHeadCell===foodCell;
    if(foodConsumed){
      growSnake(newSnakeCells)
      handleFoodConsumption(newSnakeCells)
    }
    setSnakeCells(newSnakeCells)
  }

  const growSnake=newSnakeCells=>{
    const growthNodeCoords=getGrowthNodeCoords(snake.tail,direction)
    if(isOutOfBounds(growthNodeCoords,board)){
      handleGameOver()
      return;
    }
    const newTailCell=board[growthNodeCoords.row][growthNodeCoords.col];
    const newTail=new LinkedListNode({
      row:growthNodeCoords.row,
      col:growthNodeCoords.col,
      cell:newTailCell,
    })
    const currentTail=snake.tail;
    snake.tail=newTail;
    snake.tail.next=currentTail;

    newSnakeCells.add(newTailCell)
  };

  

  const handleFoodConsumption=newSnakeCells => {
    const maxPossibleCellValue=boardSize*boardSize;
    let nextFoodCell;

    while(true){
      nextFoodCell=randomIntFromInterval(1,maxPossibleCellValue)
      if(newSnakeCells.has(nextFoodCell) || foodCell===nextFoodCell)
        continue;
      break;
    }

    setFoodCell(nextFoodCell)
    setScore(score+1)
  };

  const handleGameOver=()=>{
    setGameover(true)
    if(score>scoreboard.map(item=>item.score)){
      document.getElementById("overlay").style.display="block";
    }else{
      document.getElementById("overlay").style.display="none";
    }
  };

  console.log(score)
  console.log(scoreboard)
  

  
  const start=()=>{
    setGameover(false)
    setScore(0)
    const snakeLLStartingValue = getStartingSnakeLLValue(board)
    setSnake(new LinkedList(snakeLLStartingValue))
    setFoodCell(snakeLLStartingValue.cell+5)
    setSnakeCells(new Set([snakeLLStartingValue.cell]))
    setDirection()
  }

  window.addEventListener("keydown",(e)=>{
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code)>-1){
      e.preventDefault()
    }
}, false)


const isOutOfBounds=(coords,board)=>{
  const {row,col}=coords;
  if(row<0 || col<0) return true;
  if(row>=board.length || col>=board.length){
      return true;
    }else
  return false;
};


const getCoordsInDirection=(coords,direction)=>{
  if(direction===Direction.UP){
    return{
      row:coords.row-1,
      col:coords.col,
    };
  }
  if(direction===Direction.RIGHT){
    return{
      row:coords.row,
      col:coords.col+1,
    };
  }
  if(direction===Direction.DOWN){
    return{
      row:coords.row+1,
      col:coords.col,
    };
  }
  if(direction===Direction.LEFT){
    return{
      row:coords.row,
      col:coords.col-1,
    };
  }
}


const getDirectionFromKey=key=>{
  if(key==='ArrowUp'){
      return Direction.UP
    }
  if(key==='ArrowRight'){
      return Direction.RIGHT
    }
  if(key==='ArrowDown'){
      return Direction.DOWN
    }
  if(key==='ArrowLeft'){
      return Direction.LEFT
    }
  return '';
};

const getNextNodeDirection=(node,currentDirection)=>{
  if(node.next===null){
      return currentDirection;
    }
  const {row:currentRow,col:currentCol}=node.value;
  const {row:nextRow,col:nextCol}=node.next.value;
  if(nextRow===currentRow && nextCol===currentCol+1){
    return Direction.RIGHT;
  }
  if(nextRow===currentRow && nextCol===currentCol-1){
    return Direction.LEFT;
  }
  if(nextCol===currentCol && nextRow===currentRow+1){
    return Direction.DOWN;
  }
  if(nextCol===currentCol && nextRow===currentRow-1){
    return Direction.UP;
  }
  return '';
};

const getGrowthNodeCoords=(snakeTail,currentDirection)=>{
  const tailNextNodeDirection=getNextNodeDirection(snakeTail,currentDirection)
  const growthDirection=getOppositeDirection(tailNextNodeDirection)
  const currentTailCoords={
    row:snakeTail.value.row,
    col:snakeTail.value.col,
  };
  const growthNodeCoords=getCoordsInDirection(currentTailCoords,growthDirection)
  return growthNodeCoords;
};

const getOppositeDirection=direction=>{
  if(direction===Direction.UP){
      return Direction.DOWN
    }
  if(direction===Direction.RIGHT){
      return Direction.LEFT
    }
  if(direction===Direction.DOWN){
      return Direction.UP
    }
  if(direction===Direction.LEFT){
      return Direction.RIGHT
    }
};

const getCellClassName=(cellValue,foodCell,snakeCells)=>{
  let className='cell';
  if(cellValue===foodCell) {
      className='cell cell-grey';
  }
  if(snakeCells.has(cellValue)){
      className='cell cell-green'
    }
  return className;
};




    useEffect(()=>{
    const getScore=async ()=>{
        try{
        const res=await publicRequest.get("/score")
        setScoreboard(res.data)
        }catch(err){
            alert("Something went Wrong")
        }
    }
    getScore()
    },[])




  return (
    <>
      <div className='board_user' id="overlay">
        <User score={score}/>
      </div>
      <h1 className="score">Score: {score}</h1>
      <button className="start" onClick={start}>Restart</button>
      <div>
      <ul className='difficulty'>
          <li className='input'>
            <input type="radio" name='radio' id="easy" value={easy} onChange={(e)=>setDifficulty(e.target.value)}/>
            <label name="diff" htmlFor="easy">Easy</label>
          </li>
          <li className='input'>
            <input type="radio" name='radio' id="normal" value={normal} onChange={(e)=>setDifficulty(e.target.value)} defaultChecked/>
            <label name="diff" htmlFor="normal">Normal</label>
          </li>
          <li className='input'>
            <input type="radio" name='radio' id="hard" value={hard} onChange={(e)=>setDifficulty(e.target.value)}/>
            <label name="diff" htmlFor="hard">Hard</label>
          </li>
      </ul>
      </div>
      {gameover && <h2 className='gameover'>GAME OVER</h2>}
      <div className='board_container'>
        <div className="board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cellValue, cellIndex) => {
                const className=getCellClassName(cellValue,foodCell,snakeCells)
                return <div key={cellIndex} className={className}></div>;
              })}
            </div>
          ))}
        </div>
        <div className='board_scoreboard'>
          <Scoreboard scoreboard={scoreboard}/>
        </div>
      </div>
    </>
  )
};

const createBoard=(boardSize)=>{
  let counter=1;
  const board=[];
  for (let row=0;row<boardSize;row++) {
    const currentRow=[];
    for (let col=0;col<boardSize;col++) {
      currentRow.push(counter++)
    }
    board.push(currentRow)
  }
  return board;
};


export default Board;
