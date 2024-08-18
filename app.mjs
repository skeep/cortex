import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';



const app = express();
const port = 3000;

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the views directory to public/views
app.set('views', path.join(__dirname, 'public/views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Define menu items
const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Connections', path: '/connections' },
    { label: 'Settings', path: '/settings' }
];

// Define routes
app.get('/', (req, res) => {
    res.render('index', { currentRoute: req.path, menuItems });
});

app.get('/connections', (req, res) => {
    res.render('connections', { currentRoute: req.path, menuItems });
});

app.get('/inventory', (req, res) => {
    res.render('inventory', { currentRoute: req.path, menuItems });
});

app.get('/settings', (req, res) => {
    res.render('settings', { currentRoute: req.path, menuItems });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
