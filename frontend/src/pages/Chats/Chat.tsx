import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import axios from "axios";
import styled from 'styled-components';
import { Recipient } from '../../types/chats';
import { Send } from 'lucide-react';
import Input from '../../components/Input';


const ConversationContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #fdf6e3;
    border-radius: 0 6px 6px 0;
    overflow: hidden;
    width: 100%;
`;
const Header = styled.div`
  padding: 16px;
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid #e0d9c9;
  background-color: #fff7e6;
  color: #333;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #fdf6e3;
  display: flex;
  flex-direction: column;

  .date-divider {
    background-color: var(--hover-color);
    width: fit-content;
    padding: 5px 10px;
    border-radius: var(--border-radius);
    margin: 6px auto;

    &:not(:first-child) {
        margin-top: 16px;
    }
  }
`;

const MessageBubble = styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'fromMe',
  })<{ fromMe: boolean }>`
  align-self: ${({ fromMe }) => (fromMe ? 'flex-end' : 'flex-start')};
  margin: 6px 0;
  padding: 10px 14px;
  padding-right: 50px;
  position: relative;
  background-color: ${({ fromMe }) => (fromMe ? '#e8e0c8' : '#fffefc')};
  color: #333;
  border-radius: 16px;
  border-bottom-right-radius: ${({ fromMe }) => (fromMe ? '2px' : '16px')};
  border-bottom-left-radius: ${({ fromMe }) => (fromMe ? '16px' : '2px')};
  max-width: 70%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .time {
    font-size: 12px;
    position: absolute;
    right: 8px;
    bottom: 5px;
  }
`;


const InputContainer = styled.div`
  padding: 12px;
  border-top: 1px solid #e0d9c9;
  background-color: #fff7e6;
  display: flex;
`;

const SendButton = styled.button`
    margin-left: 8px;
    padding: 10px;
    font-size: 14px;
    background-color: #e0a96d;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s ease;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    height: 38px;

    &:hover {
        background-color: #d28e5f;
    }

`;

const EmptyChats = styled.div`
    font-size: 14px;
    width: 100%;
    height: 100%;
    font-style: italic;
    display: flex;
    justify-content: center;
    align-items: center;
`;

interface ChatProps {
    selectedRecipient: Recipient | null;
    setSelRecipient: React.Dispatch<React.SetStateAction<Recipient | null>>;
    loading: boolean;
}
function getHHMM(isoString: string) {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatFriendlyDate(dateString: string) {
    const inputDate = new Date(dateString);
    const now = new Date();
  
    // Strip time from both dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const input = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  
    // Calculate difference in days
    const diffTime = today.getTime() - input.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays > 1 && diffDays < 7) {
      return inputDate.toLocaleDateString(undefined, { weekday: 'long' });
    } else {
      const day = String(inputDate.getDate()).padStart(2, '0');
      const month = String(inputDate.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
}
  
  
const Chat = ({setSelRecipient, selectedRecipient, loading}: ChatProps) => {

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    },[selectedRecipient])

    if(!selectedRecipient) {
        return (
            <EmptyChats>
                Select a recipient to start texting
            </EmptyChats>
        )
    }

    return (
        <ConversationContainer>

            <Header>{selectedRecipient.name}</Header>

            <MessagesContainer ref={messagesEndRef}>
                {selectedRecipient.messages?.map((m, i, arr) => {
                    const currentDate = new Date(m.sentTime).toDateString();
                    const prevDate = i > 0 ? new Date(arr[i - 1].sentTime).toDateString() : null;
                    const isNewDay = currentDate !== prevDate;
                    return (
                        <React.Fragment >
                            {isNewDay && (
                                <div className="date-divider">
                                    {formatFriendlyDate(currentDate)}
                                </div>
                            )}
                            <MessageBubble key={i} fromMe={m.fromMe}>
                                {m.content}
                                <div className='time'>
                                    {getHHMM(m.sentTime)}
                                </div>
                            </MessageBubble>
                        </React.Fragment>
                    )
                })}
            </MessagesContainer>

            <InputContainer>
                <Input type='text-area' placeholder="Start typing" />
                <SendButton><Send size={18}/></SendButton>
            </InputContainer>
        </ConversationContainer>
    );
}

export default Chat;
