import { useState } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Zoom from '@material-ui/core/Zoom';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Tooltip from '@material-ui/core/Tooltip';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InfoIcon from '@material-ui/icons/Info';
import SettingsIcon from '@material-ui/icons/Settings';
import VerticalSplitIcon from '@material-ui/icons/VerticalSplit';

import SearchIcon from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';

import useStyles from './DroppyHeader.styles';

export function DroppyHeader({ handleAbout }) {
  const classes = useStyles();
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
    return true;
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
    return true;
  };

  const menuId = 'droppy-primary-header';


  const mobileMenuId = 'droppy-primary-header-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >

      
{
  // TODO: Split view on mobile?
/*
      <MenuItem>
        <IconButton aria-label="open split view" color="inherit">
          <VerticalSplitIcon />
        </IconButton>
        <p>Open Split View</p>
      </MenuItem>
*/
}
      <MenuItem>
        <IconButton aria-label="modify droppy settings" color="inherit">
          <SettingsIcon />
        </IconButton>
        <p>Settings</p>
      </MenuItem>

      <MenuItem onClick={() => handleMobileMenuClose() && handleAbout()}>
        <IconButton aria-label="information about droppy" color="inherit">
          <InfoIcon />
        </IconButton>
        <p>About</p>
      </MenuItem>
      
      <MenuItem>
        <IconButton aria-label="logout of droppy" color="inherit">
          <ExitToAppIcon />
        </IconButton>
        <p>Logout</p>
      </MenuItem>

    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar>
          <Tooltip TransitionComponent={Zoom} title="Upload files from disk">
            <IconButton
              className={classes.menuIcons}
              edge="start"
              color="inherit"
              aria-label="upload files from disk"
            >
              <CloudUploadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip TransitionComponent={Zoom}  title="Upload folder from disk">
            <IconButton
              className={classes.menuIcons}
              edge="start"
              color="inherit"
              aria-label="upload folder from disk"
            >
              <FolderSpecialIcon />
            </IconButton>
          </Tooltip>

          <Tooltip TransitionComponent={Zoom}  title="Create file">
            <IconButton
              className={classes.menuIcons}
              edge="start"
              color="inherit"
              aria-label="create file"
            >
              <NoteAddIcon />
            </IconButton>
          </Tooltip>

          <Tooltip TransitionComponent={Zoom}  title="Create folder">
            <IconButton
              className={classes.menuIcons}
              edge="start"
              color="inherit"
              aria-label="create folder"
            >
              <CreateNewFolderIcon />
            </IconButton>
          </Tooltip>

          <div className={classes.grow} />

          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <Tooltip TransitionComponent={Zoom}  title="Split View">
              <IconButton className={classes.menuIcons} aria-label="split view" color="inherit">
                <VerticalSplitIcon />
              </IconButton>
            </Tooltip>

            <Tooltip TransitionComponent={Zoom}  title="Settings">
              <IconButton className={classes.menuIcons} aria-label="settings" color="inherit">
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip TransitionComponent={Zoom}  title="About">
              <IconButton className={classes.menuIcons} aria-label="about" color="inherit" onClick={() => handleAbout()}>
                <InfoIcon />
              </IconButton>
            </Tooltip>

            <Tooltip TransitionComponent={Zoom}  title="Logout">
              <IconButton
                className={classes.menuIcons}
                edge="end"
                aria-label="logout"
                aria-controls={menuId}
                aria-haspopup="true"
                color="inherit"
              >
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </div>
  );
}
