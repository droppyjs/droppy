import React from "react"

import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import Typography from "@material-ui/core/Typography"

import {DialogTitle} from "../DialogTitle/DialogTitle"
import {DialogContent} from "../DialogContent/DialogContent"
import {DialogActions} from "../DialogActions/DialogActions"

export default function DroppyAbout({open, handleClose, settings}: DroppyAboutProps) {
  return (
    <div>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          About Droppy
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            <b>droppy</b> is a self-hosted file storage server with a web interface and capabilities
            to edit files and view media directly in the browser. It is particularly well-suited to
            be run on low-end hardware like the Raspberry Pi.
          </Typography>
          <Typography gutterBottom>
            <b>
              Find us on{" "}
              <a href="https://github.com/droppy-js/droppy" target="_blank" rel="noreferrer">
                GitHub
              </a>
              !
            </b>
          </Typography>
          <Typography gutterBottom>
            Version {settings?.version} on {settings?.platform} with {settings?.engine}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
