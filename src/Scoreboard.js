import React, { useEffect, useState } from 'react'
import { publicRequest } from './apiHandle'
import "./Scoreboard.css"

function Scoreboard({scoreboard}) {
 
  return (
    <div className='scoreboard'>
        <h2 className='scoreboard_title'>Scoreboard</h2>
        <div className='scoreboard_container'>
            {scoreboard?
            <ol className='scoreboard_lists'>
                {scoreboard.map(item=>(
                <li className='scoreboard_list' key={item._id}>
                    <span>{item.user}</span>
                    <span>{item.score}</span>
                </li>
                )).slice(0,5)}
            </ol>:
            <div className='scoreboard_lists'>No Scores Yet</div>
            }
        </div>
    </div>
  )
}

export default Scoreboard