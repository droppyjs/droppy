import { IconButton, Typography, withStyles } from "@material-ui/core";
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import React from "react";

import CloseIcon from '@material-ui/icons/Close';

import { styles } from "./DialogTitle.styles";
import { DialogTitleProps } from "./DialogTitle.types";

export const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});
