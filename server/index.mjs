import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// Konfiguracja CORS
app.use(cors());
app.use(express.json());

// Konfiguracja połączenia z bazą danych
const dbConfig = {
  host: process.env.VITE_DB_HOST,
  port: parseInt(process.env.VITE_DB_PORT || '3306'),
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASSWORD,
  database: process.env.VITE_DB_NAME,
};

// Testowy endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ success: true, message: 'Test endpoint working' });
});

// Endpoint do wykonywania zapytań SQL
app.post('/api/query', async (req, res) => {
  console.log('Query endpoint called with body:', req.body);
  try {
    const { sql, parameters } = req.body;
    console.log('Connecting to database with config:', { ...dbConfig, password: '***' });
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      console.log('Executing query:', sql, 'with parameters:', parameters);
      const [rows] = await connection.execute(sql, parameters);
      console.log('Query executed successfully');
      res.json({ success: true, data: rows });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 