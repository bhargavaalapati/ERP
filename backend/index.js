import { authenticateToken } from './middleware/authMiddleware.js'  // New Import
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'          // New Import
import jwt from 'jsonwebtoken'       // New Import
import sql from './db.js'


const app = express()
const PORT = 3000
const SECRET_KEY = "super_secret_devopod_key" // In production, move this to .env

// Middleware
app.use(cors())
app.use(express.json())

// --- EXISTING ROUTES ---
app.get('/', (req, res) => {
    res.send('✅ Devopod ERP Backend is running!')
})

app.get('/test-db', async (req, res) => {
    try {
        const result = await sql`SELECT version()`
        res.json({ message: "Database connected", version: result[0].version })
    } catch (error) {
        res.status(500).json({ error: "Database connection failed" })
    }
})

// --- HELPER: AUDIT LOGGER ---
const logAction = async (userId, action, details) => {
    try {
        await sql`
            INSERT INTO audit_logs (user_id, action, details)
            VALUES (${userId}, ${action}, ${details})
        `
    } catch (err) {
        console.error("Audit Log Failed:", err)
    }
}

// --- ADMIN & AUDIT ROUTES ---

// 1. GET AUDIT LOGS (Admin Only)
app.get('/api/admin/audit-logs', authenticateToken, async (req, res) => {
    try {
        const logs = await sql`
            SELECT audit_logs.*, users.name as user_name, users.role 
            FROM audit_logs
            JOIN users ON audit_logs.user_id = users.id
            ORDER BY created_at DESC
        `
        res.json(logs)
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch logs" })
    }
})

// 2. GET ALL USERS (To manage roles)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        const users = await sql`SELECT id, name, email, role, created_at FROM users`
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" })
    }
})

// 3. UPDATE USER ROLE
app.put('/api/admin/users/:id/role', authenticateToken, async (req, res) => {
    const { id } = req.params
    const { role } = req.body // e.g., "Admin", "Finance Manager"
    
    try {
        await sql`UPDATE users SET role = ${role} WHERE id = ${id}`
        
        // Log this action!
        await logAction(req.user.id, "Updated User Role", `Changed user ${id} to ${role}`)
        
        res.json({ message: "Role updated" })
    } catch (err) {
        res.status(500).json({ error: "Failed to update role" })
    }
})

// --- FINANCE: GENERAL LEDGER ROUTES ---

// 1. GET ACCOUNTS (Chart of Accounts)
app.get('/api/finance/accounts', authenticateToken, async (req, res) => {
    const accounts = await sql`SELECT * FROM accounts ORDER BY code ASC`
    res.json(accounts)
})

// 2. CREATE JOURNAL ENTRY (Complex!)
app.post('/api/finance/journal', authenticateToken, async (req, res) => {
    const { date, description, lines } = req.body 
    // lines = [{ account_id: 1, debit: 100, credit: 0 }, { account_id: 2, debit: 0, credit: 100 }]

    try {
        // Validation: Debits must equal Credits
        const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0)
        const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0)

        if (totalDebit !== totalCredit) {
            return res.status(400).json({ error: "Debits and Credits must be equal!" })
        }

        // 1. Create Header
        const entry = await sql`
            INSERT INTO journal_entries (date, description, status)
            VALUES (${date}, ${description}, 'Posted')
            RETURNING id
        `
        const entryId = entry[0].id

        // 2. Insert Lines & Update Account Balances
        for (const line of lines) {
            await sql`
                INSERT INTO journal_lines (entry_id, account_id, debit, credit)
                VALUES (${entryId}, ${line.account_id}, ${line.debit || 0}, ${line.credit || 0})
            `
            
            // Update the main account balance (Simplified logic: Assets increase with Debit)
            // In a real ERP, this logic depends on Account Type (Asset/Expense vs Liability/Income)
            // For this prototype, we just track the movement.
        }

        await logAction(req.user.id, "Created Journal Entry", `Entry #${entryId}: ${description}`)

        res.status(201).json({ message: "Journal Entry Posted" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to post journal entry" })
    }
})

// GET JOURNAL ENTRIES (History)
app.get('/api/finance/journal', authenticateToken, async (req, res) => {
    try {
        // We fetch the Entry Header AND the specific Lines (Debits/Credits)
        // We use JSON_AGG to bundle the lines into a single row per entry
        const journals = await sql`
            SELECT 
                je.id, 
                je.date, 
                je.description, 
                je.status,
                json_agg(
                    json_build_object(
                        'account_code', a.code,
                        'account_name', a.name,
                        'debit', jl.debit,
                        'credit', jl.credit
                    )
                ) as lines
            FROM journal_entries je
            JOIN journal_lines jl ON je.id = jl.entry_id
            JOIN accounts a ON jl.account_id = a.id
            GROUP BY je.id
            ORDER BY je.date DESC, je.id DESC
        `
        res.json(journals)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to fetch journal entries" })
    }
})

// --- NEW AUTH ROUTES ---

// 1. SIGNUP API
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body

    try {
        // Check if user already exists
        const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already exists" })
        }

        // Hash the password (encrypt it)
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert into database
        const newUser = await sql`
            INSERT INTO users (name, email, password)
            VALUES (${name}, ${email}, ${hashedPassword})
            RETURNING id, name, email
        `

        res.status(201).json({ message: "User created!", user: newUser[0] })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Signup failed" })
    }
})

// 2. LOGIN API
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body

    try {
        // Find user by email
        const users = await sql`SELECT * FROM users WHERE email = ${email}`
        
        if (users.length === 0) {
            return res.status(400).json({ error: "User not found" })
        }

        const user = users[0]

        // Compare password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password)
        
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" })
        }

        // Generate a Token (The "ID Card")
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' })

        res.json({ message: "Login successful", token, user: { id: user.id, name: user.name } })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Login failed" })
    }
})

// --- INVENTORY ROUTES ---

// 1. ADD A PRODUCT (Protected: Needs Token)
app.post('/api/products', authenticateToken, async (req, res) => {
    const { name, category, price, stock_quantity } = req.body

    try {
        const newProduct = await sql`
            INSERT INTO products (name, category, price, stock_quantity)
            VALUES (${name}, ${category}, ${price}, ${stock_quantity})
            RETURNING *
        `
        res.status(201).json({ message: "Product added!", product: newProduct[0] })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to add product" })
    }
})

// 2. GET ALL PRODUCTS (Protected: Needs Token)
app.get('/api/products', authenticateToken, async (req, res) => {
    try {
        const products = await sql`SELECT * FROM products ORDER BY created_at DESC`
        res.json(products)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" })
    }
})

// 3. UPDATE A PRODUCT (Protected)
// Usage: PUT /api/products/1
app.put('/api/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params
    const { name, category, price, stock_quantity } = req.body

    try {
        const updatedProduct = await sql`
            UPDATE products
            SET name = ${name}, 
                category = ${category}, 
                price = ${price}, 
                stock_quantity = ${stock_quantity}
            WHERE id = ${id}
            RETURNING *
        `

        if (updatedProduct.length === 0) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.json({ message: "Product updated!", product: updatedProduct[0] })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to update product" })
    }
})

// 4. DELETE A PRODUCT (Protected)
// Usage: DELETE /api/products/1
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params

    try {
        const deletedProduct = await sql`
            DELETE FROM products
            WHERE id = ${id}
            RETURNING *
        `

        if (deletedProduct.length === 0) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.json({ message: "Product deleted successfully", product: deletedProduct[0] })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to delete product" })
    }
})

// 1. PLACE AN ORDER (Protected)
app.post('/api/orders', authenticateToken, async (req, res) => {
    const { product_id, quantity } = req.body
    const user_id = req.user.id // Get User ID from the token

    try {
        // A. Fetch the product to check price and stock
        const productResult = await sql`SELECT * FROM products WHERE id = ${product_id}`
        
        if (productResult.length === 0) {
            return res.status(404).json({ error: "Product not found" })
        }

        const product = productResult[0]

        // B. Check if enough stock exists
        if (product.stock_quantity < quantity) {
            return res.status(400).json({ error: "Insufficient stock available" })
        }

        // C. Calculate Total Price
        const total_price = product.price * quantity

        // D. Create the Order
        const newOrder = await sql`
            INSERT INTO orders (user_id, product_id, quantity, total_price)
            VALUES (${user_id}, ${product_id}, ${quantity}, ${total_price})
            RETURNING *
        `

        // E. Update Inventory (Subtract stock)
        await sql`
            UPDATE products 
            SET stock_quantity = stock_quantity - ${quantity}
            WHERE id = ${product_id}
        `

        res.status(201).json({ 
            message: "Order placed successfully!", 
            order: newOrder[0] 
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to place order" })
    }
})

// 2. GET MY ORDERS (Protected)
app.get('/api/orders', authenticateToken, async (req, res) => {
    const user_id = req.user.id

    try {
        // We join tables to get the actual Product Name instead of just ID
        const orders = await sql`
            SELECT orders.id, products.name as product_name, orders.quantity, orders.total_price, orders.status, orders.created_at
            FROM orders
            JOIN products ON orders.product_id = products.id
            WHERE orders.user_id = ${user_id}
            ORDER BY orders.created_at DESC
        `
        res.json(orders)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch orders" })
    }
})

// --- DASHBOARD STATS ROUTE ---
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        // We run 3 queries in parallel using Promise.all for speed
        const [
            productsResult, 
            ordersResult, 
            lowStockResult, 
            revenueResult 
        ] = await Promise.all([
            sql`SELECT COUNT(*) FROM products`,
            sql`SELECT COUNT(*) FROM orders`,
            sql`SELECT COUNT(*) FROM products WHERE stock_quantity < 5`,
            sql`SELECT SUM(total_price) FROM orders`
        ])

        // Return the raw numbers
        res.json({
            totalProducts: productsResult[0].count,
            totalOrders: ordersResult[0].count,
            lowStock: lowStockResult[0].count,
            totalRevenue: revenueResult[0].sum || 0 // Handle case with 0 orders
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch dashboard stats" })
    }
})

// --- CONSTRUCTION MODULE ROUTES ---

// 1. PROJECTS API
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = await sql`SELECT * FROM projects ORDER BY created_at DESC`
        res.json(projects)
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch projects" })
    }
})

// UPDATED POST ROUTE (Now saves AI data)
app.post('/api/projects', authenticateToken, async (req, res) => {
    // 1. Get the new fields from the request body
    const { name, location, budget, start_date, end_date, actual_spend, completion_percentage } = req.body
    
    try {
        const newProject = await sql`
            INSERT INTO projects (
                name, location, budget, start_date, end_date, 
                actual_spend, completion_percentage
            )
            VALUES (
                ${name}, ${location}, ${budget}, ${start_date}, ${end_date}, 
                ${actual_spend || 0}, ${completion_percentage || 0}
            )
            RETURNING *
        `
        res.status(201).json(newProject[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to create project" })
    }
})

// 2. VENDORS API
app.get('/api/vendors', authenticateToken, async (req, res) => {
    try {
        const vendors = await sql`SELECT * FROM vendors ORDER BY name ASC`
        res.json(vendors)
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch vendors" })
    }
})

app.post('/api/vendors', authenticateToken, async (req, res) => {
    const { name, category, contact_email, phone } = req.body
    try {
        const newVendor = await sql`
            INSERT INTO vendors (name, category, contact_email, phone)
            VALUES (${name}, ${category}, ${contact_email}, ${phone})
            RETURNING *
        `
        res.status(201).json(newVendor[0])
    } catch (err) {
        res.status(500).json({ error: "Failed to add vendor" })
    }
})

// --- AI INSIGHTS MODULE ---

app.get('/api/ai/risk/:id', authenticateToken, async (req, res) => {
    const { id } = req.params

    try {
        // 1. Fetch Project Data
        const result = await sql`SELECT * FROM projects WHERE id = ${id}`
        if (result.length === 0) return res.status(404).json({ error: "Project not found" })
        
        const project = result[0]
        
        // --- THE AI LOGIC ENGINE ---
        let riskScore = 0
        let riskFactors = []

        // A. Budget Analysis
        const budgetUsage = (project.actual_spend / project.budget) * 100
        
        if (budgetUsage > 100) {
            riskScore += 50
            riskFactors.push("CRITICAL: Budget Exceeded")
        } else if (budgetUsage > 80 && project.completion_percentage < 50) {
            riskScore += 30
            riskFactors.push("High Spend vs Low Progress")
        }

        // B. Timeline Analysis
        const start = new Date(project.start_date)
        const end = new Date(project.end_date)
        const today = new Date()
        
        const totalDuration = end - start
        const timeElapsed = today - start
        
        // Calculate expected progress (linear)
        let expectedProgress = 0
        if (totalDuration > 0 && timeElapsed > 0) {
            expectedProgress = Math.min(100, (timeElapsed / totalDuration) * 100)
        }

        // Check for Schedule Slippage
        if (today > end && project.completion_percentage < 100) {
            riskScore += 50
            riskFactors.push("CRITICAL: Project Overdue")
        } else if ((expectedProgress - project.completion_percentage) > 20) {
            // If we should be 50% done but are only 20% done
            riskScore += 20
            riskFactors.push("Significant Schedule Lag")
        }

        // Cap score at 100
        riskScore = Math.min(100, riskScore)

        // Determine Label
        let riskLevel = "Low"
        if (riskScore >= 75) riskLevel = "Critical"
        else if (riskScore >= 40) riskLevel = "High"
        else if (riskScore >= 20) riskLevel = "Medium"

        // Return the Analysis
        res.json({
            project_id: project.id,
            project_name: project.name,
            risk_score: riskScore,
            risk_level: riskLevel,
            factors: riskFactors,
            expected_progress: Math.round(expectedProgress),
            actual_progress: project.completion_percentage
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "AI analysis failed" })
    }
})


// --- FINANCE MODULE (Fixed for your Schema) ---

// 1. GET ALL INVOICES
app.get('/api/invoices', authenticateToken, async (req, res) => {
    try {
        // We still join 'projects' to get the Project Name, but vendor_name is already in the table
        const invoices = await sql`
            SELECT 
                invoices.*, 
                projects.name as project_name
            FROM invoices
            LEFT JOIN projects ON invoices.project_id = projects.id
            ORDER BY invoices.due_date ASC
        `
        res.json(invoices)
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch invoices" })
    }
})

// 2. CREATE INVOICE
app.post('/api/invoices', authenticateToken, async (req, res) => {
    // Note: No 'description' here, and we use 'vendor_name'
    const { project_id, vendor_name, amount, type, due_date } = req.body
    
    try {
        const newInvoice = await sql`
            INSERT INTO invoices (project_id, vendor_name, amount, type, due_date, status)
            VALUES (${project_id}, ${vendor_name}, ${amount}, ${type}, ${due_date}, 'Pending')
            RETURNING *
        `
        res.status(201).json(newInvoice[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to create invoice" })
    }
})

// 3. MARK AS PAID
app.put('/api/invoices/:id/pay', authenticateToken, async (req, res) => {
    const { id } = req.params
    try {
        const updated = await sql`
            UPDATE invoices 
            SET status = 'Paid' 
            WHERE id = ${id}
            RETURNING *
        `
        res.json(updated[0])
    } catch (err) {
        res.status(500).json({ error: "Failed to update invoice" })
    }
})


// --- FINANCIAL DASHBOARD API ---
app.get('/api/finance/stats', authenticateToken, async (req, res) => {
    try {
        // 1. Calculate Totals (Income vs Expense)
        const [incomeResult, expenseResult] = await Promise.all([
            sql`SELECT SUM(amount) FROM invoices WHERE type = 'Receivable'`,
            sql`SELECT SUM(amount) FROM invoices WHERE type = 'Payable'`
        ])

        const totalIncome = Number(incomeResult[0].sum) || 0
        const totalExpense = Number(expenseResult[0].sum) || 0
        const netProfit = totalIncome - totalExpense

        // 2. Get Project Budgets vs Spend (For Bar Chart)
        const projects = await sql`
            SELECT name, budget, actual_spend 
            FROM projects 
            ORDER BY created_at DESC 
            LIMIT 5
        `

        // 3. Get Pending Invoices Count
        const pendingResult = await sql`
            SELECT COUNT(*) FROM invoices WHERE status = 'Pending'
        `

        res.json({
            summary: { totalIncome, totalExpense, netProfit, pendingInvoices: pendingResult[0].count },
            projectHealth: projects // Array for the chart
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to fetch finance stats" })
    }
})


// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})