import express from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files from /browser
app.use(express.static(join(__dirname, 'browser')));

// Start the server
const port = 4000;
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handle process termination signals to close the server gracefully
const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
