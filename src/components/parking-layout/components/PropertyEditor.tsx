import * as React from 'react';
import { Box, Slider, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { type Node } from '../types';

const StyledEditor = styled(Box)(({ theme }) => ({
  width: '300px',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.divider}`,
  height: '100%',
  overflowY: 'auto',
}));

interface PropertyEditorProps {
  selectedNode: Node | null;
  onNodeUpdate: (updates: Partial<Node>) => void;
}

export function PropertyEditor({ selectedNode: selectedNodeProp, onNodeUpdate }: PropertyEditorProps) {
  const [selectedNode, setSelectedNode] = React.useState<Node | null>(selectedNodeProp);
  React.useEffect(() => {
    if (selectedNode?.id !== selectedNodeProp?.id) {
      setSelectedNode(selectedNodeProp);
    }
  }, [selectedNodeProp]);
  if (!selectedNode) {
    return (
      <StyledEditor>
        <Typography variant="body2" color="text.secondary">
          Select a component to edit its properties
        </Typography>
      </StyledEditor>
    );
  }

  const handleSizeChange = (value: number) => {
    onNodeUpdate({ width: value, height: value });
  };

  return (
    <StyledEditor>
      <Typography variant="h6" gutterBottom>
        Properties
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Label"
          value={selectedNode.label || ''}
          onChange={(e) => {
            setSelectedNode({ ...selectedNode, label: e.target.value });
            onNodeUpdate({ label: e.target.value });
          }}
          size="small"
          fullWidth
        />

        {selectedNode.type.startsWith('slot') && (
          <>
            <Box>
              <Typography gutterBottom>Width</Typography>
              <Slider
                value={selectedNode.width || 60}
                onChange={(_, value) => {
                  setSelectedNode({ ...selectedNode, width: value as number });
                  onNodeUpdate({ width: value as number });
                }}
                min={20}
                max={200}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box>
              <Typography gutterBottom>Height</Typography>
              <Slider
                value={selectedNode.height || 30}
                onChange={(_, value) => {
                  setSelectedNode({ ...selectedNode, height: value as number });
                  onNodeUpdate({ height: value as number });
                }}
                min={20}
                max={200}
                valueLabelDisplay="auto"
              />
            </Box>
          </>
        )}

        {selectedNode.type === 'text' && (
          <>
            <Box>
              <Typography gutterBottom>Width</Typography>
              <Slider
                value={selectedNode.width || 100}
                onChange={(_, value) => {
                  setSelectedNode({ ...selectedNode, width: value as number });
                  onNodeUpdate({ width: value as number });
                }}
                min={20}
                max={200}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box>
              <Typography gutterBottom>Height</Typography>
              <Slider
                value={selectedNode.height || 30}
                onChange={(_, value) => {
                  setSelectedNode({ ...selectedNode, height: value as number });
                  onNodeUpdate({ height: value as number });
                }}
                min={20}
                max={200}
                valueLabelDisplay="auto"
              />
            </Box>
          </>
        )}

        {selectedNode.type === 'manager' && (
          <Box>
            <Typography gutterBottom>Size</Typography>
            <Slider
              value={selectedNode.width || 40}
              onChange={(_, value) => {
                setSelectedNode({ ...selectedNode, width: value as number });
                handleSizeChange(value as number);
              }}
              min={20}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>
        )}

        {selectedNode.type.startsWith('arrow') && (
          <Box>
            <Typography gutterBottom>Size</Typography>
            <Slider
              value={selectedNode.width || 30}
              onChange={(_, value) => {
                setSelectedNode({ ...selectedNode, width: value as number });
                handleSizeChange(value as number);
              }}
              min={20}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>
        )}
      </Box>
    </StyledEditor>
  );
}
