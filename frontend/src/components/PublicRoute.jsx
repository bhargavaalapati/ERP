import { Navigate, Outlet } from 'react-router-dom'

const PublicRoute = () => {
    const token = localStorage.getItem('token')

    // If user is already logged in, kick them to Dashboard
    if (token) {
        return <Navigate to="/dashboard" replace />
    }

    // Otherwise, let them see the Login page
    return <Outlet />
}

export default PublicRoute