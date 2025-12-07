import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
    // Check if token exists
    const token = localStorage.getItem('token')

    // If no token, redirect to Login
    if (!token) {
        return <Navigate to="/login" replace />
    }

    // If token exists, render the child routes (The Dashboard)
    return <Outlet />
}

export default ProtectedRoute