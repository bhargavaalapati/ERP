import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material'
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api/axios'

const KPICard = ({ title, value, icon, color }) => (
    <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
        <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: `${color}.main` }}>
                ${value.toLocaleString()}
            </Typography>
        </Box>
        <Box sx={{ bgcolor: `${color}.light`, p: 1.5, borderRadius: '50%', color: `${color}.main`, display: 'flex' }}>
            {icon}
        </Box>
    </Paper>
)

const FinanceDashboard = () => {
    // Fetch Finance Data
    const { data: stats, isLoading } = useQuery({
        queryKey: ['finance-stats'],
        queryFn: async () => (await api.get('/api/finance/stats')).data
    })

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>

    // ✅ Updated: Correct Pie Chart Mapping (Expenses → red, Income → green)
    const pieData = [
        { name: 'Expenses', value: stats.summary.totalExpense },
        { name: 'Income', value: stats.summary.totalIncome }
    ]

    const COLORS = ['#ef4444', '#22c55e'] // Red for Expenses, Green for Income

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                Financial Overview
            </Typography>

            {/* 1. KPI CARDS */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard title="Net Profit" value={stats.summary.netProfit} icon={<Wallet />} color="primary" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard title="Total Income" value={stats.summary.totalIncome} icon={<TrendingUp />} color="success" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard title="Total Expenses" value={stats.summary.totalExpense} icon={<TrendingDown />} color="error" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {/* Different layout for Pending count */}
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {stats.summary.pendingInvoices}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Pending Invoices</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* 2. CHARTS SECTION */}
            <Grid container spacing={3}>

                {/* BAR CHART: Budget vs Actual */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: 400 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Project Budget vs. Actual Spend</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={stats.projectHealth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="budget" name="Budget" fill="#3b82f6" />
                                <Bar dataKey="actual_spend" name="Actual Spent" fill="#f97316" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* PIE CHART: Income vs Expense */}
                <Grid item xs={12} sm={6} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Cash Flow Ratio</Typography>
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    )
}

export default FinanceDashboard
