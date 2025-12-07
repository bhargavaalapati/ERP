import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
    Box, 
    Drawer, 
    AppBar, 
    Toolbar, 
    List, 
    Typography, 
    Divider, 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    IconButton,
    Avatar
} from '@mui/material'
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    LogOut, 
    Menu,
    HardHat,
    Users,
    FileText,
    PieChart,
    ShieldCheck,
    BookOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'

const drawerWidth = 240

const Layout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    // Navigation Menu Items
    const menuItems = [
        { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { text: 'Inventory', icon: <Package size={20} />, path: '/inventory' },
        { text: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
        { text: 'Projects', icon: <HardHat size={20} />, path: '/projects' },
        { text: 'Vendors', icon: <Users size={20} />, path: '/vendors' },
        { text: 'Invoices', icon: <FileText size={20} />, path: '/invoices' },
        { text: 'Financials', icon: <PieChart size={20} />, path: '/financials' },
        { text: 'General Ledger', icon: <BookOpen size={20} />, path: '/gl' },
        { text: 'Admin', icon: <ShieldCheck size={20} />, path: '/admin' },
    ]

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        toast.success("Logged out")
        navigate('/login')
    }

    const drawerContent = (
        <div>
            {/* Logo Area */}
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                 <Typography variant="h6" noWrap component="div" fontWeight="bold" color="primary">
                    ERP&Finance
                </Typography>
            </Toolbar>
            <Divider />
            
            {/* Navigation Links */}
            <List sx={{ mt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton 
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    '&:hover': { bgcolor: 'primary.main' },
                                    '& .lucide': { color: 'white' } // Fix icon color on active
                                },
                                borderRadius: 2,
                                mx: 1,
                                mb: 1
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'inherit' : 'gray' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Logout Button at Bottom */}
            <Box sx={{ flexGrow: 1 }} />
            <Divider sx={{ mt: 'auto' }} />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 2, color: 'error.main' }}>
                        <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                            <LogOut size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    )

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Top Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <Menu />
                    </IconButton>
                    
                    {/* Page Title (Dynamic based on current path) */}
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, textTransform: 'capitalize' }}>
                        {location.pathname.replace('/', '') || 'Dashboard'}
                    </Typography>

                    {/* User Profile */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {user.name}
                        </Typography>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {user.name?.[0]?.toUpperCase()}
                        </Avatar>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar (Responsive) */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>
                
                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    bgcolor: '#f5f7fa' // Slight grey background for content area
                }}
            >
                <Toolbar /> {/* Spacer to push content below AppBar */}
                <Outlet /> {/* This is where Dashboard, Inventory, etc. renders */}
            </Box>
        </Box>
    )
}

export default Layout