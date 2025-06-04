import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import axios from 'axios';
import { getAddressFromCoordinates, refactorDeliveryPartnerFormData } from '../../utils/utilities';

const initialForm = {
  name: '',
  coordinates: null,
  address: '',
};

const DeliveryPartners = () => {
  const [open, setOpen] = useState(false);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null); // format: { lat: 37.7749, lng: -122.4194 }
  const [markerRef, marker] = useMarkerRef();
  const [formData, setFormData] = useState(initialForm);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // or 'error', 'info', 'warning'
  });

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
  const createDeliveryPartner = async () => {
    try {
      const validFormData = refactorDeliveryPartnerFormData(formData);
      const url = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${url}/delivery-partners`, validFormData);
      fetchDeliveryPartners();
      setSnackbar({
        open: true,
        message: 'Delivery partner created successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Delivery partner creation failed:', err.message);
      setSnackbar({
        open: true,
        message: 'Delivery partner creation failed. Please try again.',
        severity: 'error',
      });
    }
  };
  const handleSubmit = () => {
    createDeliveryPartner();
    setOpen(false);
    setFormData(initialForm);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Delivery Partners
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Create New Delivery Partner
      </Button>

      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Partner ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Coordinates</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deliveryPartners.map(partner => (
            <TableRow key={partner.id}>
              <TableCell>{partner.id}</TableCell>
              <TableCell>{partner.name}</TableCell>
              <TableCell>{partner.address}</TableCell>
              <TableCell>
                {partner.latitude && partner.longitude
                  ? `${partner.latitude.toFixed(5)}, ${partner.longitude.toFixed(5)}`
                  : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Delivery Partner</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Select Address (click on map):
              </Typography>

              <div style={{ height: 300, width: '100%', borderRadius: 4, overflow: 'hidden' }}>
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
              </div>

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
            Save Partner
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

export default DeliveryPartners;
