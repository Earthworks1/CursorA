import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the database.json file
const dbPath = path.join(process.cwd(), 'database.json');

// Sample data for the database
const sampleData = {
  tasks: [
    {
      id: "task-1",
      description: "Levé topographique site A",
      type: "leve",
      siteId: "site-1",
      assignedUserId: "user-1",
      startTime: new Date(2023, 4, 10, 9, 0).toISOString(),
      endTime: new Date(2023, 4, 10, 16, 0).toISOString(),
      status: "termine",
      notes: "Terminé avec succès",
      createdAt: new Date(2023, 4, 8).toISOString()
    },
    {
      id: "task-2",
      description: "Implantation bâtiment B",
      type: "implantation",
      siteId: "site-2",
      assignedUserId: "user-2",
      startTime: new Date(2023, 4, 15, 8, 0).toISOString(),
      endTime: new Date(2023, 4, 15, 17, 0).toISOString(),
      status: "planifie",
      notes: null,
      createdAt: new Date(2023, 4, 5).toISOString()
    }
  ],
  users: [
    { id: "user-1", name: "Antoine" },
    { id: "user-2", name: "Lucie" }
  ],
  sites: [
    { id: "site-1", name: "HSP Potier", address: "Quelque part" },
    { id: "site-2", name: "Chantier XYZ", address: "Ailleurs" }
  ]
};

// Check if the file exists
if (!fs.existsSync(dbPath)) {
  console.log(`Database file not found at ${dbPath}, creating it...`);
  
  try {
    // Create the file with sample data
    fs.writeFileSync(dbPath, JSON.stringify(sampleData, null, 2), 'utf8');
    console.log(`Created database.json with sample data`);
  } catch (error) {
    console.error(`Error creating database file:`, error);
    process.exit(1);
  }
} else {
  console.log(`Database file already exists at ${dbPath}`);
  try {
    // Read the current file to ensure it has the right structure
    const data = fs.readFileSync(dbPath, 'utf8');
    const parsedData = JSON.parse(data);
    
    // Check if it has the necessary properties
    const hasTasks = Array.isArray(parsedData.tasks);
    const hasUsers = Array.isArray(parsedData.users);
    const hasSites = Array.isArray(parsedData.sites);
    
    if (!hasTasks || !hasUsers || !hasSites) {
      console.log('Database file does not have the correct structure, fixing...');
      
      // Create a merged structure with the existing and missing data
      const fixedData = {
        tasks: hasTasks ? parsedData.tasks : sampleData.tasks,
        users: hasUsers ? parsedData.users : sampleData.users,
        sites: hasSites ? parsedData.sites : sampleData.sites
      };
      
      fs.writeFileSync(dbPath, JSON.stringify(fixedData, null, 2), 'utf8');
      console.log('Fixed database structure');
    } else {
      console.log('Database structure is valid');
    }
  } catch (error) {
    console.error(`Error checking/updating database file:`, error);
    
    // If there's an error reading or parsing the file, replace it
    console.log('Replacing corrupted database with sample data');
    fs.writeFileSync(dbPath, JSON.stringify(sampleData, null, 2), 'utf8');
  }
}

console.log('Database setup complete'); 