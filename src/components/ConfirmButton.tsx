import React, { MouseEvent, ReactElement, ReactNode, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from "@mui/material";

export const ConfirmButton: React.FC<{
  action: () => void | Promise<void>
  children: ReactNode
  component?: "Button" | "IconButton"
  dialogTitle: string
  buttonContent: ReactNode
}> = ({action, children, dialogTitle, component = "Button", buttonContent}) => {
  const [open, setOpen] = useState<boolean>(false)
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirm = async () => {
    const result = action()
    if (result instanceof Promise) {
      await result
    }
    handleClose()
  }
  return (
    <>
    {component === "Button" 
    ? <Button onClick={handleClickOpen}>
      {buttonContent}
    </Button>
    : <IconButton onClick={handleClickOpen}>
      {buttonContent}
      </IconButton>
    }
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {dialogTitle}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
    </>
  )
}