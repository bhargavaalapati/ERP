import { Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material'
import { Package, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

// --- 1. Define Helper Component OUTSIDE the main component ---
const StatCard = ({ title, value, icon, color }) => (
    <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
        <Box>
            <Typography variant="body1" color="text.secondary" fontWeight="medium">
                {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                {value}
            </Typography>
        </Box>
        <Box sx={{ bgcolor: `${color}.light`, p: 1.5, borderRadius: '50%', color: `${color}.main`, display: 'flex' }}>
            {icon}
        </Box>
    </Paper>
)

// --- 2. Main Component ---
const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    // Fetch Real Stats
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/api/dashboard/stats')
            return res.data
        }
    })

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
    if (isError) return <Alert severity="error">Failed to load dashboard data.</Alert>

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Dashboard Overview
            </Typography>
            <Typography paragraph color="text.secondary" sx={{ mb: 4 }}>
                Welcome back, {user.name}! Here is what's happening today.
            </Typography>

            <Grid container spacing={3}>
                {/* 1. Total Products */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Products" 
                        value={stats.totalProducts} 
                        icon={<Package size={28} />} 
                        color="primary" 
                    />
                </Grid>

                {/* 2. Total Orders */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Orders" 
                        value={stats.totalOrders} 
                        icon={<ShoppingCart size={28} />} 
                        color="success" 
                    />
                </Grid>

                {/* 3. Total Revenue */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Revenue" 
                        value={`$${Number(stats.totalRevenue).toLocaleString()}`} 
                        icon={<DollarSign size={28} />} 
                        color="secondary" 
                    />
                </Grid>

                {/* 4. Low Stock Alerts */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Low Stock Items" 
                        value={stats.lowStock} 
                        icon={<AlertTriangle size={28} />} 
                        color="error" 
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Dashboard