import express from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import cors from 'cors';
import { users, chantiers, lots, taches } from '../shared/schema';

const app = express();
const port = process.env.PORT || 3001;

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'spiess_planning'
});

const db = drizzle(pool);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/workload/stats', async (req, res) => {
  try {
    const [userCount] = await db.select({ count: users.id }).from(users);
    const [chantierCount] = await db.select({ count: chantiers.id }).from(chantiers);
    const [lotCount] = await db.select({ count: lots.id }).from(lots);
    const [tacheCount] = await db.select({ count: taches.id }).from(taches);

    res.json({
      users: userCount.count || 0,
      chantiers: chantierCount.count || 0,
      lots: lotCount.count || 0,
      taches: tacheCount.count || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/workload/tasks', async (req, res) => {
  try {
    const allTasks = await db.select().from(taches);
    res.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/workload/users', async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 