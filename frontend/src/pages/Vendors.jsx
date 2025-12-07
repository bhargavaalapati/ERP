import { useState } from 'react'
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Chip 
} from '@mui/material'
import { Users, Plus, Phone, Mail } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Vendors = () => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        name: '', category: '', contact_email: '', phone: ''
    })

    // Fetch Vendors
    const { data: vendors, isLoading: _IS_LOADING } = useQuery({
        queryKey: ['vendors'],
        queryFn: async () => {
            const res = await api.get('/api/vendors')
            return res.data
        }
    })

    // Add Vendor Mutation
    const addMutation = useMutation({
        mutationFn: async (newVendor) => {
            await api.post('/api/vendors', newVendor)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors'])
            toast.success("Vendor Added Successfully!")
            handleClose()
        }
    })

    const handleClose = () => setOpen(false)
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
    const handleSubmit = () => addMutation.mutate(formData)

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users /> Vendors & Suppliers
                </Typography>
                <Button variant="contained" startIcon={<Plus />} onClick={() => setOpen(true)}>
                    Add Vendor
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Contact Info</strong></TableCell>
                            <TableCell><strong>Added On</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vendors?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No vendors found.</TableCell>
                            </TableRow>
                        ) : (
                            vendors?.map((vendor) => (
                                <TableRow key={vendor.id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{vendor.name}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={vendor.category} 
                                            size="small" 
                                            color={vendor.category === 'Subcontractor' ? 'primary' : 'default'} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem' }}>
                                                <Mail size={14} /> {vendor.contact_email}
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem', color: 'text.secondary' }}>
                                                <Phone size={14} /> {vendor.phone}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Vendor Modal */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Company/Person Name" name="name" onChange={handleChange} fullWidth />
                        <TextField label="Category (e.g., Cement Supplier, Electrician)" name="category" onChange={handleChange} fullWidth />
                        <TextField label="Email" name="contact_email" type="email" onChange={handleChange} fullWidth />
                        <TextField label="Phone Number" name="phone" onChange={handleChange} fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Add Vendor</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Vendors