import React, { useState } from 'react'
import { publicRequest } from '../api/apiHandle'
import "./User.css"

function User({score}) {

    const [user,setUser]=useState("")
    
    const handleSubmit=async (e)=>{
      e.preventDefault()
      const reqObj={user,score}
        try{
          console.log(reqObj)
        const res=await publicRequest.post("/score",reqObj)
        window.location.reload("/")
        }catch(err){
            alert("Something went Wrong")
        }
      }
      

  return (
    <div className='user' id="overlay">
        <h2 className='user_title'>NEW HIGH SCORE : {score}</h2>
        <h2 className='user_title'>Enter your name</h2>
        <input type="text" name="name" maxLength="3" value={user} onChange={e=>setUser(e.target.value)} className='user_input' autoComplete="off" />
        <button className='user_button' type='submit' onClick={handleSubmit}>SUBMIT</button>
    </div>
  )
}

export default User