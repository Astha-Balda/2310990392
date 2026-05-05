import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Card, CardContent, Grid, Box, Tabs, Tab, 
  Select, MenuItem, InputLabel, FormControl, TextField, Chip 
} from '@mui/material';
import axios from 'axios';
import NotificationsIcon from '@mui/icons-material/Notifications';

const API_URL = "http://20.207.122.201/evaluation-service/notifications";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [view, setView] = useState(0); // 0: All, 1: Priority
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState('All');
  const [readIds, setReadIds] = useState(new Set());

  // Priority Mapping for Sorting
  const weights = { "Placement": 3, "Result": 2, "Event": 1 };

  useEffect(() => {
    fetchData();
  }, [typeFilter, limit, view]);

  const fetchData = async () => {
    try {
      const params = {};
      if (typeFilter !== 'All') params.notification_type = typeFilter;
      // Use query param for limit if in Priority view
      if (view === 1) params.limit = limit;

      const res = await axios.get(API_URL, { params });
      let data = res.data.notifications;

      // Stage 6 Logic: Sort by weight, then by recency (Timestamp)
      data.sort((a, b) => {
        const weightDiff = (weights[b.Type] || 0) - (weights[a.Type] || 0);
        if (weightDiff !== 0) return weightDiff;
        return new Date(b.Timestamp) - new Date(a.Timestamp);
      });

      setNotifications(data);
    } catch (err) {
      console.error("API Error", err);
    }
  };

  const markAsRead = (id) => {
    setReadIds(prev => new Set(prev).add(id));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
        AffordMed Notifications
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={view} onChange={(e, v) => setView(v)} centered>
          <Tab label="All Notifications" />
          <Tab label="Priority Inbox" />
        </Tabs>
      </Box>

      {/* Filters/Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={view === 1 ? 6 : 12}>
          <FormControl fullWidth>
            <InputLabel>Filter by Type</InputLabel>
            <Select 
              value={typeFilter} 
              label="Filter by Type" 
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {view === 1 && (
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              type="number" 
              label="Show Top 'n'" 
              value={limit} 
              onChange={(e) => setLimit(e.target.value)} 
            />
          </Grid>
        )}
      </Grid>

      {/* Notification Cards */}
      <Grid container spacing={2}>
        {notifications.map((n) => (
          <Grid item xs={12} key={n.ID}>
            <Card 
              onClick={() => markAsRead(n.ID)}
              sx={{ 
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': { boxShadow: 6 },
                borderLeft: readIds.has(n.ID) ? 'none' : '6px solid #1976d2',
                backgroundColor: readIds.has(n.ID) ? '#f9f9f9' : '#ffffff'
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon 
                  sx={{ 
                    mr: 2, 
                    color: n.Type === 'Placement' ? '#ff9800' : 
                           n.Type === 'Result' ? '#4caf50' : '#2196f3' 
                  }} 
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ fontWeight: readIds.has(n.ID) ? 400 : 700 }}
                  >
                    {n.Message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {n.Type} • {new Date(n.Timestamp).toLocaleString()}
                  </Typography>
                </Box>
                {!readIds.has(n.ID) && (
                  <Chip label="NEW" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default App;