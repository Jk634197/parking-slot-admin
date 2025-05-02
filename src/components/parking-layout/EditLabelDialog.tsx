import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

interface EditLabelDialogProps {
  open: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (newLabel: string) => void;
}

export function EditLabelDialog({ open, initialValue, onClose, onSave }: EditLabelDialogProps) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Label</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          margin="dense"
          label="Label"
          type="text"
          inputProps={{ 'aria-label': 'Label input' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
