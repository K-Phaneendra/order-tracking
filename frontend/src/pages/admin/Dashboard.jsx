import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import axios from 'axios';
import OrdersOnMap from './OrdersOnMap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const url = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  // ----- Metrics Calculation -----
  const totalOrders = orders.length;
  const totalPartners = partners.length;

  const deliveredOrders = orders.filter(order => order.is_order_delivered);
  const pendingOrders = orders.filter(order => !order.is_order_delivered);
  const deliveryCompletionRate = totalOrders
    ? ((deliveredOrders.length / totalOrders) * 100).toFixed(1)
    : '0.0';

  const priorityCount = {
    High: 0,
    Medium: 0,
    Low: 0,
  };

  const ordersByPartner = {};
  const productCount = {};
  const preferredTimeCount = {};

  orders.forEach(order => {
    const priority = order.priority || 'Medium';
    priorityCount[priority]++;

    const partnerId = order.delivery_partner_id || 'Unassigned';
    ordersByPartner[partnerId] = (ordersByPartner[partnerId] || 0) + 1;

    const product = order.product_name;
    productCount[product] = (productCount[product] || 0) + 1;

    const time = order.preferred_time || 'Unknown';
    preferredTimeCount[time] = (preferredTimeCount[time] || 0) + 1;
  });

  const barChartData = {
    labels: partners.map(p => p.name),
    datasets: [
      {
        label: 'Orders Assigned',
        data: partners.map(p => ordersByPartner[p.id] || 0),
        backgroundColor: '#1976d2',
      },
    ],
  };

  const priorityChartData = {
    labels: Object.keys(priorityCount),
    datasets: [
      {
        label: 'Order Priority',
        data: Object.values(priorityCount),
        backgroundColor: ['#d32f2f', '#fbc02d', '#388e3c'],
      },
    ],
  };

  const preferredTimeData = {
    labels: Object.keys(preferredTimeCount),
    datasets: [
      {
        label: 'Preferred Delivery Times',
        data: Object.values(preferredTimeCount),
        borderColor: '#0288d1',
        backgroundColor: 'rgba(2, 136, 209, 0.2)',
      },
    ],
  };

  const topProducts = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topProductsChart = {
    labels: topProducts.map(([name]) => name),
    datasets: [
      {
        label: 'Top Products',
        data: topProducts.map(([, count]) => count),
        backgroundColor: '#7b1fa2',
      },
    ],
  };

  const deliveryStatusChartData = {
    labels: ['Delivered', 'Pending'],
    datasets: [
      {
        label: 'Delivery Status',
        data: [deliveredOrders.length, pendingOrders.length],
        backgroundColor: ['#388e3c', '#d32f2f'],
      },
    ],
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <OrdersOnMap />
      <Grid container spacing={4}>
        {/* Metric Cards */}
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Orders</Typography>
              <Typography variant="h4">{totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Delivery Partners</Typography>
              <Typography variant="h4">{totalPartners}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Delivered Orders</Typography>
              <Typography variant="h4">{deliveredOrders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Orders</Typography>
              <Typography variant="h4">{pendingOrders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Completion Rate</Typography>
              <Typography variant="h4">{deliveryCompletionRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Orders by Priority</Typography>
              <Bar data={priorityChartData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Orders by Delivery Partner</Typography>
              <Bar data={barChartData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Preferred Delivery Time</Typography>
              <Line data={preferredTimeData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Top Products Ordered</Typography>
              <Bar data={topProductsChart} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Delivery Status</Typography>
              <Bar data={deliveryStatusChartData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Container>
  );
};

export default Dashboard;
