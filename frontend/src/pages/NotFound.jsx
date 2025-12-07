import { Box, Typography, Button, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react' // Using your icon library

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#f5f5f5'
            }}
        >
            <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
                <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '16px' }} />
                
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    404
                </Typography>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                    Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                    The page you are looking for doesn't exist or has been moved.
                </Typography>

                <Button 
                    variant="contained" 
                    onClick={() => navigate(-1)} // Go back to previous page
                    sx={{ mr: 2 }}
                >
                    Go Back
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate('/dashboard')}
                >
                    Home
                </Button>
            </Container>
        </Box>
    )
}

export default NotFound