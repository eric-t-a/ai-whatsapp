import React, { useEffect, useState } from 'react';
import axios from "axios";
import styled from 'styled-components';
import { MsgType, Recipient } from '../../types/chats';
import Chat from './Chat';

const ChatsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: calc(100vh - 180px);
`;

const RecipientsContainer = styled.div`
  width: 200px;
  border-right: 1px solid #d6cbaa;
`;

const RecipientChat = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>`
  width: 100%;
  padding: 10px;
  transition: 0.3s all;
  cursor: pointer;
  border-radius: 6px 0 0 6px;
  ${(props) => (props.selected ? 'background-color: #ffe4b5' : '')};

  &:hover {
    background-color: ${(props) => (props.selected ? '#ffe4b5' : '#ffeac4')};
  }

  .top-container {
    display: flex;
    justify-content: space-between;
    gap: 5px;

    .name {
      flex-grow: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      font-weight: 500;
    }

    .time {
      flex-shrink: 0;
    }
  }

  .message {
    padding-top: 3px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: 14px;
  }

  &:not(:last-child) {
    border-width: 0;
    border-bottom-width: 1px;
    border-style: solid;
    border-image: linear-gradient(to right, #d6cbaa00, #d6cbaa) 1;
  }
`;

const ScrollableRecipients = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const SearchContainer = styled.div`
  padding: 10px;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #fffbe6;
`;

const SearchInput = styled.input`
  padding: 8px 16px;
  border: unset;
  border-radius: 6px;
  outline: 1px solid #e0d4b7;
  border-right: 0;
  color: #3e3e3e;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: 2px solid #d3b469;
    border-color: #d3b469;
  }

  &::placeholder {
    color: #aaa;
  }
`;

function formatSmartDate(dateStr: Date) {
  const now = new Date();
  const date = new Date(dateStr);

  const pad = (n: any) => n.toString().padStart(2, '0');

  const isSameDay = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  const isWithinLastWeek = date > oneWeekAgo && date < yesterday;

  const isSameYear = date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } else if (isYesterday) {
    return "Yesterday";
  } else if (isWithinLastWeek) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  } else if (isSameYear) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  } else {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear().toString().slice(-2)}`;
  }
}


const ChatsIndex = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    axios.get('http://localhost:3000/chats')
      .then(function (response) {
        setRecipients(response.data.recipients);
      })
      .catch(function (error) {
        console.log('error fetching chats',error);
      })
  },[])

  const [search, setSearch] = useState('');

  function onClickRecipient(recipient: Recipient){
    setLoading(true);
    axios.get(`http://localhost:3000/chats/${recipient.id}/messages`)
      .then(function (response) {
        setSelRecipient({ ...recipient, messages: response.data.messages });
        setLoading(false);
        console.log(response.data.messages)
      })
      .catch(function (error) {
        setLoading(false);
        console.log('error fetching chats',error);
      })
  }

  return (
    <ChatsContainer>
      <RecipientsContainer>
        <ScrollableRecipients>
          <SearchContainer>
            <SearchInput
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchContainer>
          {recipients.map((r) => (
            <RecipientChat key={r.id} onClick={() => onClickRecipient(r)} selected={selectedRecipient?.id == r.id}>
              <div className='top-container'>
                <div className='name'>{r.name}</div>
                <div className='time'>{formatSmartDate(r.lastMsgSentTime)}</div>
              </div>
              <div className='message'>{r.lastMsg?.content}</div>
            </RecipientChat>
          ))}
        </ScrollableRecipients>
      </RecipientsContainer>
      <Chat selectedRecipient={selectedRecipient} setSelRecipient={setSelRecipient} loading={loading}/>
    </ChatsContainer>
  );
}

export default ChatsIndex;
