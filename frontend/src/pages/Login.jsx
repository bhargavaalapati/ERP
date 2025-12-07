import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography, Paper, Container, Link } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Login = () => {
    const [isSignup, setIsSignup] = useState(false) // Toggle state
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const navigate = useNavigate()

    const authMutation = useMutation({
        mutationFn: async (data) => {
            const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login'
            const res = await api.post(endpoint, data)
            return res.data
        },
        onSuccess: (data) => {
            if (isSignup) {
                toast.success("Account created! Please log in.")
                setIsSignup(false) // Switch back to login
            } else {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                toast.success(`Welcome ${data.user.name}!`)
                navigate('/dashboard')
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Authentication failed")
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        authMutation.mutate(formData)
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
            <Container maxWidth="xs">
                <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                        {isSignup ? 'Create Account' : 'Devopod ERP Login'}
                    </Typography>
                    
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        {isSignup && (
                            <TextField
                                margin="normal" required fullWidth label="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        )}
                        <TextField
                            margin="normal" required fullWidth label="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        <TextField
                            margin="normal" required fullWidth label="Password" type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        
                        <Button
                            type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={authMutation.isPending}
                        >
                            {authMutation.isPending ? 'Processing...' : (isSignup ? 'Sign Up' : 'Sign In')}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link 
                                component="button" variant="body2" 
                                onClick={() => setIsSignup(!isSignup)}
                            >
                                {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}

export default Login