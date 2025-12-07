import postgres from 'postgres'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const connectionString = process.env.DATABASE_URL

// Initialize the connection
const sql = postgres(connectionString)

export default sql