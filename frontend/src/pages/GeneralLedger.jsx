import { useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Grid, TextField, MenuItem, Chip, Collapse, IconButton } from '@mui/material'
import { BookOpen, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

// Helper Component for Expandable Rows
const JournalRow = ({ entry }) => {
    const [open, setOpen] = useState(false)

    return (
        <>
            <TableRow hover onClick={() => setOpen(!open)} sx={{ cursor: 'pointer' }}>
                <TableCell>
                    <IconButton size="small">
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </IconButton>
                </TableCell>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell><strong>{entry.description}</strong></TableCell>
                <TableCell><Chip label={entry.status} size="small" color="primary" variant="outlined" /></TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="caption" fontWeight="bold" gutterBottom>Transaction Details</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Account</TableCell>
                                        <TableCell align="right">Debit</TableCell>
                                        <TableCell align="right">Credit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {entry.lines.map((line, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{line.account_code} - {line.account_name}</TableCell>
                                            <TableCell align="right">{Number(line.debit) > 0 ? `$${Number(line.debit).toLocaleString()}` : '-'}</TableCell>
                                            <TableCell align="right">{Number(line.credit) > 0 ? `$${Number(line.credit).toLocaleString()}` : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

const GeneralLedger = () => {
    const queryClient = useQueryClient()
    const [entry, setEntry] = useState({ date: '', description: '', debitAccountId: '', creditAccountId: '', amount: '' })

    // Fetch Accounts & JOURNALS
    const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: async () => (await api.get('/api/finance/accounts')).data })
    const { data: journals } = useQuery({ queryKey: ['journals'], queryFn: async () => (await api.get('/api/finance/journal')).data })

    const postMutation = useMutation({
        mutationFn: async () => {
            const lines = [
                { account_id: entry.debitAccountId, debit: entry.amount, credit: 0 },
                { account_id: entry.creditAccountId, debit: 0, credit: entry.amount }
            ]
            await api.post('/api/finance/journal', { date: entry.date, description: entry.description, lines })
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['journals']) // Refresh the list!
            toast.success("Journal Entry Posted")
            setEntry({ date: '', description: '', debitAccountId: '', creditAccountId: '', amount: '' })
        }
    })

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookOpen /> General Ledger
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* 1. CHART OF ACCOUNTS */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Chart of Accounts</Typography>
                        <Table size="small">
                            <TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Type</TableCell></TableRow></TableHead>
                            <TableBody>
                                {accounts?.map((acc) => (
                                    <TableRow key={acc.id}>
                                        <TableCell>{acc.code}</TableCell>
                                        <TableCell>{acc.name}</TableCell>
                                        <TableCell>{acc.type}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                {/* 2. NEW ENTRY FORM */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>New Manual Journal Entry</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField label="Date" type="date" InputLabelProps={{ shrink: true }} value={entry.date} onChange={(e) => setEntry({...entry, date: e.target.value})} />
                            <TextField label="Description" value={entry.description} onChange={(e) => setEntry({...entry, description: e.target.value})} />
                            
                            <TextField select label="Debit Account (Dr)" value={entry.debitAccountId} onChange={(e) => setEntry({...entry, debitAccountId: e.target.value})}>
                                {accounts?.map((a) => <MenuItem key={a.id} value={a.id}>{a.code} - {a.name}</MenuItem>)}
                            </TextField>

                            <TextField select label="Credit Account (Cr)" value={entry.creditAccountId} onChange={(e) => setEntry({...entry, creditAccountId: e.target.value})}>
                                {accounts?.map((a) => <MenuItem key={a.id} value={a.id}>{a.code} - {a.name}</MenuItem>)}
                            </TextField>

                            <TextField label="Amount" type="number" value={entry.amount} onChange={(e) => setEntry({...entry, amount: e.target.value})} />

                            <Button variant="contained" startIcon={<Save />} onClick={() => postMutation.mutate()}>
                                Post Entry
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* 3. NEW SECTION: JOURNAL HISTORY TABLE */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Journal Entries</Typography>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ width: 50 }}></TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {journals?.map((entry) => (
                            <JournalRow key={entry.id} entry={entry} />
                        ))}
                        {journals?.length === 0 && (
                            <TableRow><TableCell colSpan={4} align="center">No journal entries found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    )
}

export default GeneralLedger