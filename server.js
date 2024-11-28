import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const db = new sqlite3.Database('./db.sqlite');

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      date TEXT,
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  


});

// Customer routes
app.post('/api/customers', (req, res) => {
  const { name, phone, email } = req.body;
  db.run(
    'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
    [name, phone, email],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/customers/:id', (req, res) => {
  const { name, phone, email } = req.body;
  db.run(
    'UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?',
    [name, phone, email, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;

  db.run(
    'DELETE FROM customers WHERE id = ?',
    customerId,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Клиент не найден' });
      }
      res.json({ success: true, message: 'Клиент успешно удален' });
    }
  );
});

// Product routes
app.post('/api/products', (req, res) => {
  const { name, price, quantity } = req.body;
  db.run(
    'INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)',
    [name, price, quantity],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/products/:id', (req, res) => {
  const { name, price, quantity } = req.body;
  db.run(
    'UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?',
    [name, price, quantity, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;

  db.run(
    'DELETE FROM products WHERE id = ?',
    productId,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Продукт не найден' });
      }
      res.json({ success: true, message: 'Продукт успешно удален' });
    }
  );
});

// Purchase routes
app.post('/api/purchases', (req, res) => {
  const { customer_id, product_id, quantity } = req.body;
  const date = new Date().toISOString();

  db.serialize(() => {
    db.all('SELECT quantity FROM products WHERE id = ?', [product_id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      console.debug(rows[0].quantity);
      if (rows[0].quantity >= quantity) {
        db.run('BEGIN TRANSACTION');
        console.debug('BEGIN TRANSACTION');
        db.run(
          'INSERT INTO purchases (customer_id, product_id, quantity, date) VALUES (?, ?, ?, ?)',
          [customer_id, product_id, quantity, date],
          function (err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }

            db.run(
              'UPDATE products SET quantity = quantity - ? WHERE id = ?',
              [quantity, product_id],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }

                db.run('COMMIT');
                res.json({ id: this.lastID });
              }
            );
          }
        );

      }
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}. Click http://localhost:${PORT}`);
});