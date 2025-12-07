import { useState } from 'react'
import { 
    Box, 
    Button, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material'
import { Plus, Package } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Inventory = () => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock_quantity: ''
    })

    // 1. FETCH PRODUCTS (Read)
    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/api/products')
            return res.data
        }
    })

    // 2. ADD PRODUCT (Create)
    const addMutation = useMutation({
        mutationFn: async (newProduct) => {
            await api.post('/api/products', newProduct)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']) // Refresh table automatically
            toast.success("Product Added!")
            handleClose()
        },
        onError: () => {
            toast.error("Failed to add product")
        }
    })

    const handleOpen = () => setOpen(true)
    
    const handleClose = () => {
        setOpen(false)
        setFormData({ name: '', category: '', price: '', stock_quantity: '' }) // Reset form
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = () => {
        if (!formData.name || !formData.price) return toast.error("Name and Price are required")
        addMutation.mutate(formData)
    }

    // --- RENDER ---
    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
    if (isError) return <Alert severity="error">Failed to load inventory.</Alert>

    return (
        <Box>
            {/* Header Area */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Package /> Inventory
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<Plus />} 
                    onClick={handleOpen}
                >
                    Add Product
                </Button>
            </Box>

            {/* Product Table */}
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Product Name</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Price</strong></TableCell>
                            <TableCell><strong>Stock</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No products found. Add one!</TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id} hover>
                                    <TableCell>{product.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                                    <TableCell>{product.category || 'N/A'}</TableCell>
                                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                    <TableCell>{product.stock_quantity}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={product.stock_quantity > 0 ? "In Stock" : "Out of Stock"} 
                                            color={product.stock_quantity > 5 ? "success" : product.stock_quantity > 0 ? "warning" : "error"}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Product Modal (Dialog) */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Add New Product</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField 
                            label="Product Name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            fullWidth 
                            autoFocus
                        />
                        <TextField 
                            label="Category" 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange} 
                            fullWidth 
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField 
                                label="Price ($)" 
                                name="price" 
                                type="number" 
                                value={formData.price} 
                                onChange={handleChange} 
                                fullWidth 
                            />
                            <TextField 
                                label="Stock Quantity" 
                                name="stock_quantity" 
                                type="number" 
                                value={formData.stock_quantity} 
                                onChange={handleChange} 
                                fullWidth 
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={addMutation.isPending}
                    >
                        {addMutation.isPending ? "Adding..." : "Add Product"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Inventory