import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5500;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the /public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the /build directory
app.use('/build', express.static(path.join(__dirname, 'build')));

// Serve static files from the /node_modules directory
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Serve the worldcities.csv file from the root directory
app.get('/worldcities.csv', (req, res) => {
	res.sendFile(path.join(__dirname, 'worldcities.csv'));
});

// Serve index.html for the root route
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
