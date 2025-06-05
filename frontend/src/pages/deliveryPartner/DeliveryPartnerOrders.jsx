import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { deliveryTimes, priorities } from '../../constants';
import axios from 'axios';

const DeliveryPartnerOrders = () => {
  const [selectedPartner, setSelectedPartner] = useState('');
  const [sortTime, setSortTime] = useState(false);
  const [sortPriority, setSortPriority] = useState(false);
  const [deliveryPartnerOrders, setDeliveryPartnerOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // or 'error', 'info', 'warning'
  });

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      const url = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${url}/delivery-partners`);
      setDeliveryPartners(res.data);
    } catch (err) {
      console.error('Failed to fetch delivery partners:', err.message);
    }
  };
  useEffect(() => {
    if (selectedPartner.length > 0) {
      fetchOrdersByDeliveryPartner();
    }
  }, [selectedPartner]);

  const fetchOrdersByDeliveryPartner = async () => {
    try {
      const url = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${url}/orders/delivery-partner/${selectedPartner}`);
      setDeliveryPartnerOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch delivery partner orders:', err.message);
    }
  };

  const markAsDelivered = async (orderId) => {
  try {
    const url = import.meta.env.VITE_API_URL;
    await axios.patch(`${url}/orders/${orderId}/deliver`, {
      is_order_delivered: true,
    });
    setSnackbar({
      open: true,
      message: 'Order marked as delivered!',
      severity: 'success',
    });
    fetchOrdersByDeliveryPartner(); // Refresh data
  } catch (error) {
    setSnackbar({
      open: true,
      message: 'Failed to update order',
      severity: 'error',
    });
    console.error('Mark as delivered error:', error.message);
  }
};


  const filteredOrders = useMemo(() => {
    let result = [...deliveryPartnerOrders];

    if (selectedPartner) {
      result = result.filter(order => order.delivery_partner_id === selectedPartner);
    }

    if (sortTime) {
      result.sort(
        (a, b) => deliveryTimes.indexOf(a.preferred_time) - deliveryTimes.indexOf(b.preferred_time)
      );
    }

    if (sortPriority) {
      result.sort((a, b) => priorities.indexOf(a.priority) - priorities.indexOf(b.priority));
    }

    return result;
  }, [selectedPartner, sortTime, sortPriority, deliveryPartnerOrders]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Orders to Deliver
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Delivery Partner</InputLabel>
          <Select
            value={selectedPartner}
            label="Select Delivery Partner"
            onChange={e => setSelectedPartner(e.target.value)}
          >
            {deliveryPartners.map(partner => (
              <MenuItem key={partner.id} value={partner.id}>
                {partner.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={() => setSortTime(!sortTime)}>
          Sort by Delivery Time {sortTime ? '▲' : '▼'}
        </Button>

        <Button variant="outlined" onClick={() => setSortPriority(!sortPriority)}>
          Sort by Priority {sortPriority ? '▲' : '▼'}
        </Button>
      </Box>

      <Table>
  <TableHead>
    <TableRow>
      <TableCell>Order ID</TableCell>
      <TableCell>Customer Name</TableCell>
      <TableCell>Product</TableCell>
      <TableCell>Qty</TableCell>
      <TableCell>Preferred Delivery Time</TableCell>
      <TableCell>Priority</TableCell>
      <TableCell>Partner</TableCell>
      <TableCell>Coordinates</TableCell>
      <TableCell>Delivery Status</TableCell>
      <TableCell>Action</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {filteredOrders.map(order => (
      <TableRow key={order.id}>
        <TableCell>{order.id}</TableCell>
        <TableCell>{order.customer_name}</TableCell>
        <TableCell>{order.product_name}</TableCell>
        <TableCell>{order.quantity}</TableCell>
        <TableCell>{order.preferred_time}</TableCell>
        <TableCell>{order.priority}</TableCell>
        <TableCell>{order.delivery_partner_id}</TableCell>
        <TableCell>
          {order.latitude && order.longitude
            ? `${order.latitude.toFixed(3)}, ${order.longitude.toFixed(3)}`
            : '—'}
        </TableCell>
        <TableCell>{order.is_order_delivered ? 'Delivered' : 'Pending'}</TableCell>
        <TableCell>
          {!order.is_order_delivered && (
            <Button
              variant="contained"
              size="small"
              color="success"
              onClick={() => markAsDelivered(order.id)}
            >
              Mark as Delivered
            </Button>
          )}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DeliveryPartnerOrders;
