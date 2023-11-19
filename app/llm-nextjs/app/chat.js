"use client"
import { useState } from "react";

export default function Chat() {

    const [chatme, setChatme] = useState([{type: "llm", text: "You underestimate my power!"}, {type: "me", text: "It's over Anakin, I have the high ground."}])

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        setChatme((prev) => [...prev, {type: "me", text: event.target.value}]);
        event.target.value = null
      }
    };

    return [
    
      <div className="p-3">
        { chatme.map((i,idx) => {
          return i.type === "llm" ?
              
                <div key={idx} className="flex items-end overflow-auto gap-1">
                  <div className="avatar placeholder">
                    <div className="text-neutral-content rounded-full w-8">
                      <span>GPT</span>
                    </div>
                  </div> 

                  <div className="chat chat-start">
                    <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
                  </div>
                </div>
              :  
              <div key={idx}  className="chat chat-end">
                <div className="bg-primary  chat-bubble">You underestimate my power!</div>
              </div>
              
        })}

      </div>,
      <div className="flex-end items-center relative">
        <input type="text" placeholder="Type here" className="input input-bordered input-primary w-full " onKeyDown={handleKeyDown}/>
        </div>
    ]
  }