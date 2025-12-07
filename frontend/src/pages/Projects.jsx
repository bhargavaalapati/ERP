import { useState } from 'react'
import { 
    Box, Typography, Button, Paper, Grid, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, LinearProgress, Chip, IconButton 
} from '@mui/material'
import { HardHat, Plus, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Projects = () => {
    const [open, setOpen] = useState(false)
    const [aiResult, setAiResult] = useState(null) // Store AI analysis
    const [aiOpen, setAiOpen] = useState(false) // Toggle AI Modal
    
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        name: '', location: '', budget: '', start_date: '', end_date: '', 
        actual_spend: 0, completion_percentage: 0 
    })

    // Fetch Projects
    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await api.get('/api/projects')
            return res.data
        }
    })

    // Add Project Mutation
    const addMutation = useMutation({
        mutationFn: async (newProject) => {
            await api.post('/api/projects', newProject)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['projects'])
            toast.success("Project Created!")
            setOpen(false)
        }
    })

    // Call AI API
    const analyzeRisk = async (id) => {
        try {
            const toastId = toast.loading("AI is analyzing project health...")
            const res = await api.get(`/api/ai/risk/${id}`)
            toast.dismiss(toastId)
            setAiResult(res.data)
            setAiOpen(true)
        } catch {
            toast.error("Analysis failed")
        }
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
    const handleSubmit = () => addMutation.mutate(formData)

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HardHat /> Projects
                </Typography>
                <Button variant="contained" startIcon={<Plus />} onClick={() => setOpen(true)}>
                    New Project
                </Button>
            </Box>

            <Grid container spacing={3}>
                {projects?.map((project) => (
                    <Grid item xs={12} md={6} lg={4} key={project.id}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
                            {/* Project Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">{project.name}</Typography>
                                <Chip label={project.status} color={project.status === 'Active' ? 'primary' : 'default'} size="small" />
                            </Box>
                            
                            {/* Stats */}
                            <Typography variant="body2" color="text.secondary">Budget: ${Number(project.budget).toLocaleString()}</Typography>
                            <Typography variant="body2" color="text.secondary">Spent: ${Number(project.actual_spend || 0).toLocaleString()}</Typography>
                            
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Typography variant="caption">Completion: {project.completion_percentage || 0}%</Typography>
                                <LinearProgress variant="determinate" value={project.completion_percentage || 0} sx={{ height: 8, borderRadius: 5 }} />
                            </Box>

                            {/* AI Button */}
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                fullWidth 
                                startIcon={<Activity />}
                                onClick={() => analyzeRisk(project.id)}
                            >
                                AI Risk Analysis
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* CREATE PROJECT MODAL */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>New Project</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Name" name="name" onChange={handleChange} fullWidth />
                        <TextField label="Location" name="location" onChange={handleChange} fullWidth />
                        <TextField label="Budget ($)" name="budget" type="number" onChange={handleChange} fullWidth />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Actual Spend ($)" name="actual_spend" type="number" onChange={handleChange} fullWidth defaultValue={0} />
                            <TextField label="Progress (%)" name="completion_percentage" type="number" onChange={handleChange} fullWidth defaultValue={0} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Start Date" name="start_date" type="date" InputLabelProps={{ shrink: true }} onChange={handleChange} fullWidth />
                            <TextField label="End Date" name="end_date" type="date" InputLabelProps={{ shrink: true }} onChange={handleChange} fullWidth />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* AI INSIGHTS RESULT MODAL */}
            <Dialog open={aiOpen} onClose={() => setAiOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Activity /> AI Project Insights
                </DialogTitle>
                <DialogContent>
                    {aiResult && (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h6" gutterBottom>Risk Assessment for: <strong>{aiResult.project_name}</strong></Typography>
                            
                            {/* Score Circle */}
                            <Box sx={{ 
                                position: 'relative', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', mb: 3 
                            }}>
                                <Box sx={{
                                    width: 120, height: 120, borderRadius: '50%', 
                                    border: `8px solid ${aiResult.risk_level === 'Critical' ? '#ef4444' : aiResult.risk_level === 'High' ? '#f97316' : '#22c55e'}`,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Typography variant="h3" fontWeight="bold">{aiResult.risk_score}</Typography>
                                    <Typography variant="caption">RISK SCORE</Typography>
                                </Box>
                            </Box>

                            <Typography variant="h5" color={aiResult.risk_level === 'Critical' ? 'error' : aiResult.risk_level === 'High' ? 'warning.main' : 'success.main'} fontWeight="bold" gutterBottom>
                                {aiResult.risk_level} Risk Level
                            </Typography>

                            {/* Risk Factors List */}
                            {aiResult.factors.length > 0 ? (
                                <Box sx={{ bgcolor: '#fff4f4', p: 2, borderRadius: 2, mt: 2, textAlign: 'left' }}>
                                    <Typography variant="subtitle2" color="error" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AlertTriangle size={18} /> Detected Issues:
                                    </Typography>
                                    <ul>
                                        {aiResult.factors.map((factor, index) => (
                                            <li key={index}><Typography variant="body2">{factor}</Typography></li>
                                        ))}
                                    </ul>
                                </Box>
                            ) : (
                                <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 2, mt: 2 }}>
                                    <Typography variant="subtitle2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                        <CheckCircle size={18} /> Project is on track!
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAiOpen(false)} variant="contained">Close Report</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Projects