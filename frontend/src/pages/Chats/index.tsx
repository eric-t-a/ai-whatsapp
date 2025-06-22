import React, { useEffect, useState } from 'react';
import axios from "axios";

const ChatsIndex = () => {
  const [recipients, setRecipients] = useState([]);
  
  useEffect(() => {
    async function getRecipients() {
      const result = await axios.get('http://localhost:3000/chats')

    }

    getRecipients()
  },[])
  return (
    <div>

    </div>
  );
}

export default ChatsIndex;
