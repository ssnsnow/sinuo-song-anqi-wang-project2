import {React, useContext} from 'react'
import '../style/cell.css'
import {ColorContext} from '../game';

function Cell(props) {
  const color = useContext(ColorContext);
  let colorName = "default-"+color;
  if (props.item.state === 1){
    colorName = "matched-"+color;
  } else if (props.item.state === 2){
    colorName = "wrongPos-"+color;
  } else if (props.item.state === 3){
    colorName = "wrongChar-"+color;
  }
  return (
    <div className={`square character ${colorName}`}>{props.item.char}</div>
  )
}

export default Cell