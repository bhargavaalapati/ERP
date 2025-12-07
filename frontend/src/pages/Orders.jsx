import { useState } from 'react'
import { 
    Box, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Chip,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert
} from '@mui/material'
import { ShoppingCart, Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Orders = () => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    
    // Form State
    const [orderData, setOrderData] = useState({
        product_id: '',
        quantity: 1
    })

    // 1. FETCH ORDERS (The main table data)
    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await api.get('/api/orders')
            return res.data
        }
    })

    // 2. FETCH PRODUCTS (For the "Select Product" dropdown)
    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/api/products')
            return res.data
        }
    })

    // 3. CREATE ORDER MUTATION
    const createOrderMutation = useMutation({
        mutationFn: async (newOrder) => {
            await api.post('/api/orders', newOrder)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']) // Refresh orders list
            queryClient.invalidateQueries(['products']) // Refresh inventory (stock goes down!)
            toast.success("Order Placed Successfully!")
            handleClose()
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Failed to place order")
        }
    })

    const handleOpen = () => setOpen(true)
    const handleClose = () => {
        setOpen(false)
        setOrderData({ product_id: '', quantity: 1 })
    }

    const handleSubmit = () => {
        if (!orderData.product_id || orderData.quantity < 1) {
            return toast.error("Please select a product and valid quantity")
        }
        createOrderMutation.mutate(orderData)
    }

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
    if (isError) return <Alert severity="error">Failed to load orders.</Alert>

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCart /> Orders
                </Typography>
                <Button variant="contained" startIcon={<Plus />} onClick={handleOpen}>
                    New Order
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Order ID</strong></TableCell>
                            <TableCell><strong>Product</strong></TableCell>
                            <TableCell><strong>Quantity</strong></TableCell>
                            <TableCell><strong>Total Price</strong></TableCell>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No orders yet.</TableCell>
                            </TableRow>
                        ) : (
                            orders?.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>#{order.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{order.product_name}</TableCell>
                                    <TableCell>{order.quantity}</TableCell>
                                    <TableCell>${Number(order.total_price).toFixed(2)}</TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={order.status} 
                                            color={order.status === 'Completed' ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* NEW ORDER MODAL */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
                <DialogTitle>Create New Order</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        
                        {/* PRODUCT SELECTOR */}
                        <TextField
                            select
                            label="Select Product"
                            value={orderData.product_id}
                            onChange={(e) => setOrderData({...orderData, product_id: e.target.value})}
                            fullWidth
                        >
                            {products?.map((product) => (
                                <MenuItem key={product.id} value={product.id} disabled={product.stock_quantity === 0}>
                                    {product.name} (${product.price}) - {product.stock_quantity} in stock
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* QUANTITY INPUT */}
                        <TextField
                            label="Quantity"
                            type="number"
                            value={orderData.quantity}
                            onChange={(e) => setOrderData({...orderData, quantity: parseInt(e.target.value)})}
                            fullWidth
                            inputProps={{ min: 1 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={createOrderMutation.isPending}
                    >
                        {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Orders