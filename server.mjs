import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';
import { Transform } from 'stream';


// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Function to clean up the CSV data
const cleanCsv = (data) => {
  // Remove extra new lines and trim whitespace
  return data.split('\n')
    .map(line => line.split(',').map(value => value.trim()).join(','))
    .join('\n');
};

// Route to read and process CSV file
app.get('/read-csv', (req, res) => {
  const filePath = path.join(__dirname, 'data/PT_FAR.csv'); // Replace 'data.csv' with your CSV file name

  const nodes = new Map();  // To keep track of unique nodes and their IDs
  const edges = [];         // To store edges with IDs
  let idCounter = 1;        // Unique ID counter

  // Read and clean the CSV file content
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const cleanedContent = cleanCsv(fileContent);

  // Create a transform stream to process the cleaned content
  const cleanStream = new Transform({
    transform(chunk, encoding, callback) {
      callback(null, chunk);
    }
  });

  cleanStream.end(cleanedContent);

  // Read and parse the CSV file
  const results = [];
  cleanStream
    .pipe(csvParser())
    .on('data', (row) => {
      const cleanedRow = {};

      // Iterate over each key in the row object
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          // Check if the key should be replaced
          switch (key) {
            case "Source Description":
              cleanedRow["from"] = row[key].trim();
              break;
            case "Destination Description":
              cleanedRow["to"] = row[key].trim();
              break;
            case "Service":
              cleanedRow["port"] = row[key].trim();
              break;
            default:
              // Otherwise, keep the key as is
              cleanedRow[key] = row[key].trim();
          }
        }
      }
      results.push(cleanedRow);
    })
    .on('end', () => {
      // Process rows
      results.forEach(row => {
        const { from, to, SourceIP, DestinationIP } = row;

        // Assign unique IDs to each node if not already assigned
        if (!nodes.has(from)) {
          nodes.set(from, { id: idCounter++, label: from, color: '#fff4b3', group: 0, SourceIP, DestinationIP });
        }
        if (!nodes.has(to)) {
          nodes.set(to, { id: idCounter++, label: to, color: '#c9e1e6', group: 1, SourceIP, DestinationIP });
        }

        // Create edges with node IDs
        edges.push({
          from: nodes.get(from).id,
          to: nodes.get(to).id,
          color: { inherit: "both" },
          arrows: "to"
        });
      });

      // Convert nodes map to array of objects
      const nodeArray = Array.from(nodes.values());

      // Send the results as JSON response
      res.json({
        nodes: nodeArray,
        edges: edges
      });
    })
    .on('error', (err) => {
      res.status(500).send('Error reading CSV file');
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

