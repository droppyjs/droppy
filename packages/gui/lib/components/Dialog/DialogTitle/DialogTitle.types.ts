import { WithStyles } from "@material-ui/core";
import { styles } from "./DialogTitle.styles";

export interface DialogTitleProps extends WithStyles<typeof styles> {
  open: boolean;
  handleClose: CallableFunction;
  settings: any;
}