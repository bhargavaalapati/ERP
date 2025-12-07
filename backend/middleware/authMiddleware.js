import jwt from 'jsonwebtoken'

const SECRET_KEY = "super_secret_devopod_key" // Must match the one in index.js

export const authenticateToken = (req, res, next) => {
    // 1. Get the token from the header (Authorization: Bearer <token>)
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Removes "Bearer "

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." })
    }

    // 2. Verify the token
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" })
        }
        
        // 3. Attach user info to the request so the next function can use it
        req.user = user
        next() // Continue to the actual API route
    })
}