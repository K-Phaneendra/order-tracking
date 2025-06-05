import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import axios from 'axios';
import { getAddressFromCoordinates, refactorOrderFormData } from '../../utils/utilities';
import { deliveryTimes, priorities } from '../../constants';

const initialOrderForm = {
  customer_name: '',
  product_name: '',
  quantity: '',
  delivery_partner_id: '',
  preferred_time: '',
  priority: '',
  coordinates: null,
  address: '',
};

const Orders = () => {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [filterPriority, setFilterPriority] = useState('');
  const [sortTime, setSortTime] = useState(false);
  const [sortPriority, setSortPriority] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // or 'error', 'info', 'warning'
  });

  const [formData, setFormData] = useState(initialOrderForm);

  const [currentLocation, setCurrentLocation] = useState(null); // format: { lat: 37.7749, lng: -122.4194 }
  const [markerRef, marker] = useMarkerRef();

  useEffect(() => {
    if (!marker) {
      return;
    }

    console.log('in use eff', marker);

    // do something with marker instance here
  }, [marker]);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setCurrentLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  async function fetchAddress() {
    const { lat, lng } = currentLocation;
    const address = await getAddressFromCoordinates(lat, lng);
    setFormData({
      ...formData,
      address: address,
      coordinates: { lat, lng },
    });
  }

  useEffect(() => {
    if (currentLocation) {
      fetchAddress();
    }
  }, [currentLocation]);

  console.log('formdata', formData);
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
  // Fetch orders from backend on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const url = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${url}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err.message);
    }
  };
  const createOrder = async () => {
    try {
      const validFormData = refactorOrderFormData(formData);
      const url = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${url}/orders`, validFormData);
      fetchOrders();
      setSnackbar({
        open: true,
        message: 'Order created successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Order creation failed:', err.message);
      setSnackbar({
        open: true,
        message: 'Order creation failed. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleMapClick = async e => {
    const { lat, lng } = e.detail.latLng;

    try {
      const address = await getAddressFromCoordinates(lat, lng);

      setFormData({
        ...formData,
        coordinates: { lat, lng },
        address,
      });
    } catch (error) {
      console.error('Failed to get address from coordinates:', error.message);
      setFormData({
        ...formData,
        coordinates: { lat, lng },
        address: '',
      });
    }
  };

  const handleSubmit = () => {
    createOrder();
    setOpen(false);
    setFormData(initialOrderForm);
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filterPriority) {
      result = result.filter(order => order.priority === filterPriority);
    }
    if (sortTime) {
      result.sort(
        (a, b) => deliveryTimes.indexOf(a.preferred_time) - deliveryTimes.indexOf(b.preferred_time)
      );
    }
    if (sortPriority) {
      const priorityMap = { low: 1, medium: 2, high: 3 };
      result.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
    }
    return result;
  }, [orders, filterPriority, sortTime, sortPriority]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Create New Order
      </Button>

      <Box sx={{ my: 2, display: 'flex', gap: 2 }}>
        <FormControl>
          <InputLabel>Filter by Priority</InputLabel>
          <Select
            label="Filter by Priority"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All</MenuItem>
            {priorities.map(p => (
              <MenuItem key={p} value={p}>
                {p}
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
            <TableCell>Customer</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Delivery Partner</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Coordinates</TableCell>
            <TableCell>Delivery Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredOrders.map(order => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>{order.product_name}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>
                {deliveryPartners.find(dp => dp.id === order.delivery_partner_id)?.name || '—'}
              </TableCell>
              <TableCell>{order.preferred_time}</TableCell>
              <TableCell>{order.priority}</TableCell>
              <TableCell>{order.address}</TableCell>
              <TableCell>
                {order.latitude && order.longitude
                  ? `${order.latitude.toFixed(3)}, ${order.longitude.toFixed(3)}`
                  : '—'}
              </TableCell>
              <TableCell>{order.is_order_delivered ? 'Delivered' : 'Pending'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Order Creation Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.customer_name}
                onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.product_name}
                onChange={e => setFormData({ ...formData, product_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Delivery Partner</InputLabel>
                <Select
                  value={formData.delivery_partner_id}
                  onChange={e => setFormData({ ...formData, delivery_partner_id: e.target.value })}
                >
                  {deliveryPartners.map(partner => (
                    <MenuItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Delivery Time</InputLabel>
                <Select
                  value={formData.preferred_time}
                  onChange={e => setFormData({ ...formData, preferred_time: e.target.value })}
                >
                  {deliveryTimes.map(t => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                >
                  {priorities.map(p => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Select Address (click on map):</Typography>
              <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <Map
                  style={{ height: '300px', width: '100%' }}
                  defaultCenter={currentLocation}
                  zoom={18}
                  gestureHandling={'greedy'}
                  onClick={handleMapClick}
                >
                  <Marker ref={markerRef} position={formData.coordinates || currentLocation} />
                </Map>
              </APIProvider>
              {formData.coordinates && (
                <Typography sx={{ mt: 1 }}>
                  Selected Coordinates: {formData.coordinates.lat.toFixed(5)},{' '}
                  {formData.coordinates.lng.toFixed(5)}
                </Typography>
              )}
              {formData.coordinates && (
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

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

export default Orders;
