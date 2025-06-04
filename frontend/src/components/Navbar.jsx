import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Order Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/admin/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/admin/orders">
            Orders
          </Button>
          <Button color="inherit" component={Link} to="/admin/delivery-partners">
            Delivery Partners
          </Button>
          <Button color="inherit" component={Link} to="/delivery-partner/orders-to-deliver">
            Delivery Partner Orders
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
