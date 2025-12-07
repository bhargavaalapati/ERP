import { useState } from 'react'
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, MenuItem, IconButton
} from '@mui/material'
import { FileText, Plus, CheckCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Invoices = () => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    
    // Updated Form State (No description, uses vendor_name)
    const [formData, setFormData] = useState({
        project_id: '', 
        vendor_name: '', 
        amount: '', 
        type: 'Payable', 
        due_date: ''
    })

    // Fetch Data
    const { data: invoices } = useQuery({ queryKey: ['invoices'], queryFn: async () => (await api.get('/api/invoices')).data })
    const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: async () => (await api.get('/api/projects')).data })
    const { data: vendors } = useQuery({ queryKey: ['vendors'], queryFn: async () => (await api.get('/api/vendors')).data })

    const createMutation = useMutation({
        mutationFn: async (data) => await api.post('/api/invoices', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices'])
            toast.success("Invoice Created")
            setOpen(false)
        }
    })

    const payMutation = useMutation({
        mutationFn: async (id) => await api.put(`/api/invoices/${id}/pay`),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices'])
            toast.success("Marked as Paid")
        }
    })

    const handleSubmit = () => createMutation.mutate(formData)

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText /> Finance & Invoices
                </Typography>
                <Button variant="contained" startIcon={<Plus />} onClick={() => setOpen(true)}>
                    New Invoice
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Related Project</strong></TableCell>
                            <TableCell><strong>Vendor / Client</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Amount</strong></TableCell>
                            <TableCell><strong>Due Date</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices?.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center">No invoices found.</TableCell></TableRow>
                        ) : (
                            invoices?.map((inv) => (
                                <TableRow key={inv.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">{inv.project_name || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell>{inv.vendor_name || '-'}</TableCell>
                                    <TableCell>
                                        {inv.type === 'Receivable' ? 
                                            <Chip icon={<ArrowDownCircle size={14}/>} label="Income" color="success" size="small" variant="outlined"/> : 
                                            <Chip icon={<ArrowUpCircle size={14}/>} label="Expense" color="error" size="small" variant="outlined"/>
                                        }
                                    </TableCell>
                                    <TableCell fontWeight="bold">${Number(inv.amount).toLocaleString()}</TableCell>
                                    <TableCell>{new Date(inv.due_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip label={inv.status} color={inv.status === 'Paid' ? 'success' : 'warning'} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        {inv.status === 'Pending' && (
                                            <IconButton color="success" onClick={() => payMutation.mutate(inv.id)} title="Mark as Paid">
                                                <CheckCircle size={20} />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* CREATE INVOICE MODAL */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        
                        <TextField select label="Type" name="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} fullWidth>
                            <MenuItem value="Payable">Accounts Payable (Expense)</MenuItem>
                            <MenuItem value="Receivable">Accounts Receivable (Income)</MenuItem>
                        </TextField>

                        <TextField select label="Project" name="project_id" value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})} fullWidth>
                            {projects?.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                        </TextField>

                        {/* Vendor Selection (Saves Name string) */}
                        {formData.type === 'Payable' ? (
                            <TextField select label="Vendor" name="vendor_name" value={formData.vendor_name} onChange={(e) => setFormData({...formData, vendor_name: e.target.value})} fullWidth>
                                {vendors?.map((v) => <MenuItem key={v.id} value={v.name}>{v.name}</MenuItem>)}
                            </TextField>
                        ) : (
                            <TextField label="Client Name" name="vendor_name" value={formData.vendor_name} onChange={(e) => setFormData({...formData, vendor_name: e.target.value})} fullWidth />
                        )}

                        <TextField label="Amount ($)" name="amount" type="number" onChange={(e) => setFormData({...formData, amount: e.target.value})} fullWidth />
                        <TextField label="Due Date" name="due_date" type="date" InputLabelProps={{ shrink: true }} onChange={(e) => setFormData({...formData, due_date: e.target.value})} fullWidth />

                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Create Invoice</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Invoices