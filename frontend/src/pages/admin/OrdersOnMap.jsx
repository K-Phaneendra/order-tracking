import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
} from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend
);

const url = import.meta.env.VITE_API_URL;

// Custom Marker Icons
const greenIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const yellowIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const OrdersOnMap = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      const ordersRes = await axios.get(`${url}/orders`);
      const partnersRes = await axios.get(`${url}/delivery-partners`);
      setOrders(ordersRes.data);
      setPartners(partnersRes.data);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  const getDeliveryPartnerNameFromId = (id) => {
    return partners.find(p => p.id === id)?.name || 'delivery partner not assigned'
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const center = [20.5937, 78.9629]; // Default to India center

  return (
    <React.Fragment>
      <Typography variant="h4" gutterBottom>
        
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setMapOpen(true)}
        sx={{ mb: 2 }}
        fullWidth
      >
        See orders on map
      </Button>

      {/* Existing dashboard metrics remain untouched */}

      {/* Map Dialog */}
      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Orders Map View
          <IconButton
            aria-label="close"
            onClick={() => setMapOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <MapContainer
            center={center}
            zoom={5}
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {orders.map((order, idx) => {
              const lat = parseFloat(order.latitude);
              const lng = parseFloat(order.longitude);
              if (!lat || !lng) return null;

              return (
                <Marker
                  key={idx}
                  position={[lat, lng]}
                  icon={order.is_order_delivered ? greenIcon : yellowIcon}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div>
                      <strong>Product:</strong> {order.product_name}
                      <br />
                      <strong>Qty:</strong> {order.quantity}
                      <br />
                      <strong>Preferred:</strong> {order.preferred_time}
                      <br />
                      <strong>Delivery partner:</strong> {getDeliveryPartnerNameFromId(order.delivery_partner_id)}
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default OrdersOnMap;
