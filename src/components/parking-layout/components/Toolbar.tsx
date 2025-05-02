import * as React from 'react';
import { Box, Button, FormControlLabel, IconButton, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CarSimple,
  Eye,
  FloppyDisk,
  PencilSimple,
  TextT,
  UploadSimple,
  User,
} from '@phosphor-icons/react';

import { type NodeType } from '../types';

const StyledToolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
}));

const StyledDraggableIcon = styled(IconButton)({
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
});

interface ToolbarProps {
  readOnly: boolean;
  viewMode: boolean;
  onViewModeChange: (viewMode: boolean) => void;
  onToolbarDragStart: (type: NodeType) => void;
  onSave: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  slotSuffix: string;
  onSlotSuffixChange: (suffix: string) => void;
  slotSeries: number | '';
  onSlotSeriesChange: (series: number | '') => void;
}

export function Toolbar({
  readOnly,
  viewMode,
  onViewModeChange,
  onToolbarDragStart,
  onSave,
  onFileUpload,
  slotSuffix,
  onSlotSuffixChange,
  slotSeries,
  onSlotSeriesChange,
}: ToolbarProps) {
  const handleDragStart = (type: NodeType) => {
    onToolbarDragStart(type);
  };

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSlotSuffixChange(e.target.value);
  };

  const handleSeriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = value === '' ? '' : parseInt(value, 10);
    onSlotSeriesChange(parsedValue);
  };

  const handleViewModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onViewModeChange(e.target.checked);
  };

  return (
    <StyledToolbar>
      {!readOnly && (
        <>
          <Tooltip title="Add Horizontal Parking Slot">
            <StyledDraggableIcon
              onMouseDown={() => {
                handleDragStart('slot-h');
              }}
              color="primary"
            >
              <CarSimple weight="bold" />
            </StyledDraggableIcon>
          </Tooltip>
          <Tooltip title="Add Vertical Parking Slot">
            <StyledDraggableIcon
              onMouseDown={() => {
                handleDragStart('slot-v');
              }}
              color="primary"
            >
              <CarSimple weight="bold" style={{ transform: 'rotate(90deg)' }} />
            </StyledDraggableIcon>
          </Tooltip>
          <Tooltip title="Add Text">
            <StyledDraggableIcon
              onMouseDown={() => {
                handleDragStart('text');
              }}
              color="primary"
            >
              <TextT weight="bold" />
            </StyledDraggableIcon>
          </Tooltip>
          <Tooltip title="Add Manager Station">
            <StyledDraggableIcon
              onMouseDown={() => {
                handleDragStart('manager');
              }}
              color="secondary"
            >
              <User weight="bold" />
            </StyledDraggableIcon>
          </Tooltip>
          <Tooltip title="Add Right Arrow">
            <StyledDraggableIcon
              onMouseDown={() => {
                handleDragStart('arrow-right');
              }}
              color="warning"
            >
              <ArrowRight weight="bold" />
            </StyledDraggableIcon>
          </Tooltip>
          <Tooltip title="Add Left Arrow">
            <StyledDraggableIcon
              onMouseDown={() => {
                handleDragStart('arrow-left');
              }}
              color="warning"
            >
              <ArrowLeft weight="bold" />
            </StyledDraggableIcon>
          </Tooltip>
          <Tooltip title="Add Up Arrow">
            <StyledDraggableIcon
              onMouseDown={() => {
                handleDragStart('arrow-up');
              }}
              color="warning"
            >
              <ArrowUp weight="bold" />
            </StyledDraggableIcon>
          </Tooltip>
          <Tooltip title="Add Down Arrow">
            <StyledDraggableIcon
              onMouseDown={() => {
                handleDragStart('arrow-down');
              }}
              color="warning"
            >
              <ArrowDown weight="bold" />
            </StyledDraggableIcon>
          </Tooltip>

          <TextField
            size="small"
            label="Slot Suffix"
            value={slotSuffix}
            onChange={handleSuffixChange}
            placeholder="e.g., S"
            sx={{ width: 120 }}
          />
          <TextField
            label="Series Start"
            type="number"
            value={slotSeries}
            onChange={handleSeriesChange}
            size="small"
            inputProps={{ min: 1 }}
            sx={{ width: 100 }}
          />
        </>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {!readOnly && (
        <>
          <Button variant="contained" startIcon={<FloppyDisk weight="bold" />} onClick={onSave}>
            Save Layout
          </Button>
          <Button variant="outlined" startIcon={<UploadSimple weight="bold" />} component="label">
            Load Layout
            <input type="file" hidden accept="application/json" onChange={onFileUpload} />
          </Button>
        </>
      )}

      <FormControlLabel
        control={<Switch checked={viewMode} onChange={handleViewModeChange} disabled={readOnly} />}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {viewMode ? <Eye weight="bold" size={20} /> : <PencilSimple weight="bold" size={20} />}
            <Typography>{viewMode ? 'View Mode' : 'Edit Mode'}</Typography>
          </Box>
        }
      />
    </StyledToolbar>
  );
}
