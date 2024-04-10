import { Modal, Box, Typography, Button, TextField } from '@mui/material';
// Style for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function SwapModal({ open, onClose }) {
  // You can also include state and methods for handling the swap logic here

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="swap-modal-title"
      aria-describedby="swap-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="swap-modal-title" variant="h6" component="h2">
          Swap Tokens
        </Typography>
        {/* Include your form and logic for swapping tokens here */}
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="amount"
            label="Amount to Swap"
            name="amount"
            autoFocus
          />
          {/* Add more form fields if necessary */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Swap
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}


