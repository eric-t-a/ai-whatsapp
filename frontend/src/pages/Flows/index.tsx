import React from 'react';
import '@xyflow/react/dist/style.css';
import styled from 'styled-components';
import Flow from './Flow';
import { Plus } from 'lucide-react';

const FlowsContainer = styled.div`
  display: flex;
`;

const FlowsList = styled.div`
  width: 200px;
  flex-shrink: 0;
  flex-grow: 0;
  border-right: 1px solid var(--border-color);

  .flow {
    padding: 10px;
    width: 100%;
    cursor: pointer;
    border-radius: var(--border-radius) 0 0 var(--border-radius);


    &:hover {
      background-color: var(--hover-color);
    }

    &.selected {
      background-color: var(--selected-color);
    }

    .name {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      font-weight: 500;
    }

    .description {
      padding-top: 3px;
      font-size: 12px;
    }

    &.new-flow {
      text-align: center;
      padding-top: 12px;
      background-color: var(--light-btn-color);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: 0.3s all;

      &:hover {
        background-color: var(--hover-color);
      }
    }

  }
`;

const FlowsIndex = () => {
  return (
    <FlowsContainer>
      <FlowsList>
        <div className='flow'>
          <div className='name'>
            Flow 1
          </div>
          <div className='description'>
            Description of flow 1
          </div>
        </div>
        <div className='flow'>
          <div className='name'>
            Flow 2
          </div>
          <div className='description'>
            Description of flow 2
          </div>
        </div>
        <div className='flow new-flow'>
          <Plus size={18}/>
        </div>
      </FlowsList>
      <Flow />
    </FlowsContainer>
  );
}

export default FlowsIndex;
