import React from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, MenuItem, Select } from '@mui/material'
import { ShieldCheck, History } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'


const Admin = () => {
    const queryClient = useQueryClient()

    // Fetch Users & Logs
    const { data: users } = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/api/admin/users')).data })
    const { data: logs } = useQuery({ queryKey: ['audit-logs'], queryFn: async () => (await api.get('/api/admin/audit-logs')).data })

    // Update Role Mutation
    const roleMutation = useMutation({
        mutationFn: async ({ id, role }) => await api.put(`/api/admin/users/${id}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries(['users'])
            toast.success("User Role Updated")
        }
    })

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldCheck /> System Administration
            </Typography>

            {/* USER MANAGEMENT */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>User Roles & Permissions</Typography>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                            {users?.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Select 
                                            value={u.role || 'Project Manager'} 
                                            size="small"
                                            onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                                            sx={{ minWidth: 150 }}
                                        >
                                            <MenuItem value="Admin">Admin</MenuItem>
                                            <MenuItem value="Finance Manager">Finance Manager</MenuItem>
                                            <MenuItem value="Project Manager">Project Manager</MenuItem>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* AUDIT LOGS */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <History /> Audit Logs
                </Typography>
                <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs?.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                    <TableCell>{log.user_name} <Chip label={log.role} size="small" style={{marginLeft: 5}}/></TableCell>
                                    <TableCell fontWeight="bold">{log.action}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    )
}

export default Admin