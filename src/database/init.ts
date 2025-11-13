import { db, runQuery } from './connection';

async function initDatabase() {
  try {
    // Create users table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birthdate TEXT NOT NULL,
        address TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    // Create products table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Products table created');

    // Create cart table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        qty INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    console.log('Cart table created');

    // Create transactions table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        cart_id INTEGER NOT NULL,
        admin_fee REAL NOT NULL,
        subtotal REAL NOT NULL,
        total REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (cart_id) REFERENCES cart(id)
      )
    `);
    console.log('Transactions table created');

    // Insert sample products
    const products = [
      { name: 'Laptop', image: 'https://via.placeholder.com/150/laptop', price: 999.99 },
      { name: 'Smartphone', image: 'https://via.placeholder.com/150/phone', price: 699.99 },
      { name: 'Headphones', image: 'https://via.placeholder.com/150/headphones', price: 149.99 },
      { name: 'Keyboard', image: 'https://via.placeholder.com/150/keyboard', price: 79.99 },
      { name: 'Mouse', image: 'https://via.placeholder.com/150/mouse', price: 49.99 },
      { name: 'Monitor', image: 'https://via.placeholder.com/150/monitor', price: 299.99 },
      { name: 'Webcam', image: 'https://via.placeholder.com/150/webcam', price: 89.99 },
      { name: 'Desk Lamp', image: 'https://via.placeholder.com/150/lamp', price: 39.99 }
    ];

    for (const product of products) {
      await runQuery(
        'INSERT OR IGNORE INTO products (name, image, price) VALUES (?, ?, ?)',
        [product.name, product.image, product.price]
      );
    }
    console.log('Sample products inserted');

    console.log('Database initialization completed!');
    // Don't close the db connection as it's shared with the server
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
