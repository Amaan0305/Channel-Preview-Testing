import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography
} from '@mui/material';

/**
 * DeleteConfirmationDialog component displays a confirmation dialog for deleting a channel or link.
 * 
 * Props:
 * - open: Boolean, controls whether the dialog is open or closed.
 * - onClose: Function, callback function to handle closing the dialog.
 * - onDelete: Function, callback function to handle deletion action.
 * - title: String, title of the dialog.
 * - message: String, confirmation message.
 */
export default function DeleteConfirmationDialog({ open, onClose, onDelete, title, message }) {
  // Handle confirmation of deletion
  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          autoFocus
          sx={{
            color: 'white',
            bgcolor: 'red',
            '&:hover': {
              bgcolor: 'darkred' // Change to a darker shade of red on hover
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
