import React from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styled from 'styled-components';

const FlowContainer = styled.div`
  height: calc(-160px + 100dvh);
  flex-grow: 1;
`;
const Flow = () => {
  return (
    <FlowContainer>
      <ReactFlow>
        <Background />
        <Controls />
      </ReactFlow>
    </FlowContainer>
  );
}

export default Flow;
