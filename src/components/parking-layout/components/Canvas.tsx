import * as React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

import { useCanvas } from '../hooks/use-canvas';
import { type Node } from '../types';

const StyledCanvas = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '500px',
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
  border: '2px dashed #ccc',
  borderRadius: '4px',
});

interface CanvasProps {
  nodes: Node[];
  viewMode: boolean;
  onNodeClick: (node: Node) => void;
  onNodeDoubleClick: (node: Node, index: number) => void;
  onNodeDragStart: (e: React.MouseEvent, index: number, node: Node) => void;
  onNodeDrag: (e: React.MouseEvent<HTMLDivElement>) => void;
  onNodeDragEnd: (e: React.MouseEvent) => void;
  selectedNode: Node | null;
  onNodeSelect: (node: Node | null) => void;
}

export function Canvas({
  nodes,
  viewMode,
  onNodeClick,
  onNodeDoubleClick,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragEnd,
  selectedNode,
  onNodeSelect,
}: CanvasProps) {
  const { canvasRef, svgRef, renderNodes } = useCanvas({
    nodes,
    viewMode,
    onNodeClick: (node) => {
      onNodeClick(node);
      onNodeSelect(node);
    },
    onNodeDoubleClick,
    onNodeDragStart,
    selectedNode,
  });

  React.useEffect(() => {
    renderNodes();
  }, [nodes, renderNodes]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onNodeSelect(null);
    }
  };

  return (
    <Box sx={{ flex: 1, position: 'relative' }}>
      <StyledCanvas
        ref={canvasRef}
        onMouseMove={onNodeDrag}
        onMouseUp={onNodeDragEnd}
        onMouseLeave={onNodeDragEnd}
        onClick={handleCanvasClick}
        style={{ pointerEvents: 'auto' }}
      >
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      </StyledCanvas>
      <div
        id="node-preview"
        style={{
          position: 'fixed',
          display: 'none',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />
    </Box>
  );
}
