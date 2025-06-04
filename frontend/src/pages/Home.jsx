import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Home = () => {
  return (
    <Container sx={{ 'text-align': 'center' }}>
      <Typography variant="h4" sx={{ my: 4 }}>
        Welcome to Order Management System
      </Typography>
      <Box
        component="img"
        src="https://t3.ftcdn.net/jpg/03/12/59/90/360_F_312599036_tWyz3n52P5qevUgHfj9P5LNQUgMfWgtG.jpg"
        alt="Order Management"
        width="80%"
        sx={{ borderRadius: 2, maxHeight: 500, objectFit: 'fill' }}
      />
    </Container>
  );
};

export default Home;
