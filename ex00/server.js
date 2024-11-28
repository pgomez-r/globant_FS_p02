import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the /public directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to serve environment variables
app.get('/env', (req, res) => {
	res.json({
		GEMINI_API_KEY: process.env.GEMINI_API_KEY,
		MAPS_API_KEY: process.env.MAPS_API_KEY,
	});
});

// Serve static files from the /build directory
app.use('/build', express.static(path.join(__dirname, 'build')));

// Serve static files from the /node_modules directory
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Read and parse the CSV file
let cityData = [];
fs.readFile(path.join(__dirname, 'worldcities.csv'), 'utf8', (err, data) => {
	if (err) {
		console.error('Error reading CSV file:', err);
		return;
	}
	const rows = data.split('\n');
	cityData = rows.map(row => {
		const [name, , latitude, longitude, country] = row.split(',').map(value => value.replace(/"/g, '').trim());
		return { name, latitude, longitude, country };
	});
	console.log('CSV data loaded:', cityData.length, 'records');
});

// Serve the parsed CSV data
app.get('/citydata', (req, res) => {
	res.json(cityData);
});

// Serve index.html for the root route
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
