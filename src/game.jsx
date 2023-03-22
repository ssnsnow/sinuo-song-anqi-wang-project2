import { useState, useRef, useEffect,createContext} from 'react';
import Title from './components/title'
import Board from './components/board';
import './style/page.css';
import './style/reset-button.css';
import '../six-letter-word.json';
import '../seven-letter-word.json';
import './style/message.css';

export const ColorContext = createContext(null);

function Game({difficulty}) {

  let attempts;
  let wordSize;
  let fileName;

  if (difficulty === "normal") {
    attempts = 6;
    wordSize = 6;
    fileName = '../six-letter-word.json'
  } else {
    attempts = 5;
    wordSize = 7;
    fileName = '../seven-letter-word.json'
  }
  
  const [board, setBoard] = useState(createBoard(attempts, wordSize));
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [attemptMessage, setAttemptMessage] = useState(`You have ${attempts} attempts remaining!`);
  const [currRow, setCurrRow] = useState(0);
  const [currCol, setCurrCol] = useState(0);
  const [randomWord, setRandomWord] = useState('');

  const myRef = useRef(null);

  useEffect(() => {
    myRef.current.focus();
  }, []);

  useEffect(() => {
    async function fetchWords() {
      const response = await fetch(fileName);
      const words = await response.json();
      const randomIndex = Math.floor(Math.random() * words.length);
      const randomWord = words[randomIndex];
      setRandomWord(randomWord.toUpperCase());
    }
    fetchWords();
  }, []);

  function handleKeyDown(event) {
    setErrorMessage(" ");
    const letterKeys = /^[A-Za-z]$/;

    if(event.key.match(letterKeys)){
      if (currRow < attempts && currCol < wordSize) {
        let newBoard = [...board];
        newBoard[currRow][currCol].char = event.key.toUpperCase();
        setBoard(newBoard);
        setCurrCol(currCol + 1);
      }
    } else if (event.keyCode === 13) {
      if (currCol < wordSize) {
        setErrorMessage(`Please enter a word with at least ${wordSize} letters!`);
        return;
      }
      let remainingAttempts = attempts - currRow - 1;
      setAttemptMessage(`You have ${remainingAttempts} attempts remaining!`);
      if (currCol === wordSize) {
        let input = toWord(board[currRow]);
        if (compare(randomWord, input)) {
          let newBoard = [...board];
          let charIdx = 0;
          while (charIdx < wordSize) {
            newBoard[currRow][charIdx].state = 1;
            charIdx++;
          }
          setBoard(newBoard);
          setAttemptMessage(" ");
          setSuccessMessage("Congratulations!  Would you like to try again?");
          setErrorMessage(" ")
          return;
        } else {
          let charIdx = 0;
          const freq = {};
          for (let c of randomWord) {
            freq[c] = freq[c] ? freq[c] + 1 : 1;
          }
          let newBoard = [...board];
          while (charIdx < wordSize) {
            if (randomWord[charIdx] === input[charIdx]) {
              newBoard[currRow][charIdx].state = 1;
              freq[randomWord[charIdx]]--;
            } else {
              newBoard[currRow][charIdx].state = 3;
            }
            charIdx++;
          }
          charIdx = 0;
          while (charIdx < wordSize) {
            if (randomWord.includes(input[charIdx]) 
                && freq[input[charIdx]] 
                && freq[input[charIdx]] > 0 
                && newBoard[currRow][charIdx].state != 1) {
              newBoard[currRow][charIdx].state = 2;
              freq[input[charIdx]]--;
            }
            charIdx++;
          }
          setBoard(newBoard);
          if (remainingAttempts === 0) {
            setAttemptMessage(`You lose! Answer is ${randomWord}!`);
            setErrorMessage(" ");
            return;
          }
          setCurrRow(currRow + 1);
          setCurrCol(0);
          
        }
      }
    } else if (event.keyCode === 8) {
      let newBoard = [...board];
      let tempCol = currCol - 1;
      newBoard[currRow][tempCol].char = " ";
      setBoard(newBoard);
      setCurrCol(tempCol);
      return;
    }
  }

  function toWord(list) {
    let wordList = [];
    for (let i = 0; i < list.length; i++) {
      wordList.push(list[i].char);
    }
    wordList = wordList.join('');
    return wordList;
  }

  function compare(randomWord, word) {
    return randomWord.toUpperCase() === word;
  }

  function createBoard(attemptsAllowedNum, size) {
    let matrix = Array(attemptsAllowedNum).fill().map(() => {
      return Array(size).fill().map(() => {
        return { char: " ", state: 0 };
      });
    });
    return matrix;
  }

  function handleResetClick() {
    setBoard(createBoard(attempts, wordSize));
    setErrorMessage(" ");
    setSuccessMessage(" ");
    setAttemptMessage(`You have ${attempts} attempts remaining!`);
    setCurrRow(0);
    setCurrCol(0);
    window.location.reload(false);
  }
 
  return (
    <div>
      <div className="no-focus" ref={myRef} tabIndex={0} onKeyDown={handleKeyDown}>
        <Title />
        <div className="difficulty">
          {difficulty}
        </div>
        <div className="startMessage">
          Please enter a {wordSize} long word to start :)
        </div>
          {successMessage && <p className="success">{successMessage}</p >}
          <ColorContext.Provider value="color">
            <Board matrix={board}/>
          </ColorContext.Provider>
          {attemptMessage && <p className="info">{attemptMessage}</p >}
          {errorMessage && <p className="error">{errorMessage}</p >}
        
      </div>
      <button onClick={handleResetClick} className="reset-button">Reset</button>
    </div>

  );
}

export default Game