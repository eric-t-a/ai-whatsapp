import React, { useEffect, useState } from 'react';
import axios from "axios";
import styled from 'styled-components';
import { Recipient } from '../../types/chats';


const ConversationContainer = styled.div`


`;

interface ChatProps {
    selectedRecipient: Recipient | null;
    setSelRecipient: React.Dispatch<React.SetStateAction<Recipient | null>>;
}

const Chat = ({setSelRecipient, selectedRecipient}: ChatProps) => {

  return (
    <ConversationContainer>

    </ConversationContainer>
  );
}

export default Chat;
