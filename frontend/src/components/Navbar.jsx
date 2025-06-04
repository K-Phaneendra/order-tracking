import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link } from 'react-router-dom';

// Top-level nav items
const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Delivery Partner', path: '/delivery-partner/orders-to-deliver' },
];

// Admin submenu
const adminSubItems = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Manage Orders', path: '/admin/orders' },
  { label: 'Manage Delivery Partners', path: '/admin/delivery-partners' },
];

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleAdminMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <Box onClick={toggleDrawer(false)} sx={{ width: 250 }}>
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.label} component={Link} to={item.path}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem>
          <ListItemText primary="Admin" />
        </ListItem>
        {adminSubItems.map((subItem) => (
          <ListItem
            button
            key={subItem.label}
            component={Link}
            to={subItem.path}
            sx={{ pl: 4 }}
          >
            <ListItemText primary={subItem.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Order Management
          </Typography>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                edge="end"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  component={Link}
                  to={item.path}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                color="inherit"
                onClick={handleAdminMenuClick}
                endIcon={<ArrowDropDownIcon />}
              >
                Admin
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleAdminMenuClose}
              >
                {adminSubItems.map((subItem) => (
                  <MenuItem
                    key={subItem.label}
                    component={Link}
                    to={subItem.path}
                    onClick={handleAdminMenuClose}
                  >
                    {subItem.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
