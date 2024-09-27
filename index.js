// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const app = express();
// const PORT = 3000;

// app.use(express.json()); // Middleware to parse JSON bodies

// let items = []; // In-memory "database"
// let currentId = 1;

// // CREATE (POST) - Add a new item with validation
// app.post(
//   '/items',
//   [
//     body('name').isString().withMessage('Name must be a string').notEmpty().withMessage('Name is required'),
//     body('description').isLength({ min: 5 }).withMessage('Description must be at least 5 characters long'),
//   ],
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       // Return only the error messages
//       const errorMessages = errors.array().map(error => error.msg);
//       return res.status(400).json({ errors: errorMessages });
//     }

//     const newItem = {
//       id: currentId++,
//       name: req.body.name,
//       description: req.body.description,
//     };
//     items.push(newItem);
//     res.status(201).json(newItem);
//   }
// );

// // READ (GET) - Get all items
// app.get('/items', (req, res) => {
//   res.json(items);
// });

// // READ (GET) - Get an item by ID
// app.get('/items/:id', (req, res) => {
//   const item = items.find(i => i.id == req.params.id);
//   if (!item) {
//     return res.status(404).json({ message: 'Item not found' });
//   }
//   res.json(item);
// });

// // UPDATE (PUT) - Update an item by ID with validation
// app.put(
//   '/items/:id',
//   [
//     body('name').optional().isString().withMessage('Name must be a string'),
//     body('description').optional().isLength({ min: 5 }).withMessage('Description must be at least 5 characters long'),
//   ],
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       // Return only the error messages
//       const errorMessages = errors.array().map(error => error.msg);
//       return res.status(400).json({ errors: errorMessages });
//     }

//     const item = items.find(i => i.id == req.params.id);
//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     item.name = req.body.name || item.name;
//     item.description = req.body.description || item.description;

//     res.json(item);
//   }
// );

// // DELETE (DELETE) - Delete an item by ID
// app.delete('/items/:id', (req, res) => {
//   const index = items.findIndex(i => i.id == req.params.id);
//   if (index === -1) {
//     return res.status(404).json({ message: 'Item not found' });
//   }
//   items.splice(index, 1);
//   res.status(204).send(); // 204 No Content
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
const PORT = 3000;

// Initialize Sequelize
const sequelize = new Sequelize('sqlite::memory:'); // Adjust for your database

// Middleware
app.use(express.json()); // Middleware to parse JSON bodies

// Define models (User, Book, Sale) without createdAt and updatedAt
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { timestamps: false }); // Remove createdAt and updatedAt

const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { timestamps: false }); // Remove createdAt and updatedAt

const Sale = sequelize.define('Sale', {
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, { timestamps: false }); // Remove createdAt and updatedAt

// Define many-to-many relationship between Users and Books
User.belongsToMany(Book, { through: 'UserBooks', timestamps: false }); // Disable timestamps in join table
Book.belongsToMany(User, { through: 'UserBooks', timestamps: false }); // Disable timestamps in join table

// Define one-to-many relationship between Book and Sale
Book.hasMany(Sale);
Sale.belongsTo(Book);

// Sync models with the database
(async () => {
  await sequelize.sync({ force: true });

  // Sample data for testing
  const user1 = await User.create({ name: 'Alice' });
  const user2 = await User.create({ name: 'Bob' });

  const book1 = await Book.create({ title: 'Node.js Guide' });
  const book2 = await Book.create({ title: 'JavaScript Basics' });

  // Assign multiple users to books (many-to-many)
  await book1.addUsers([user1, user2]);
  await book2.addUser(user1);

  await Sale.create({ price: 10.99, BookId: book1.id });
  await Sale.create({ price: 12.99, BookId: book1.id });
  await Sale.create({ price: 8.99, BookId: book2.id });
})();

// Get All Books with authors and sales details
app.get('/books', async (req, res) => {
  const books = await Book.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] }, // Exclude timestamps
    include: [
      {
        model: User,
        attributes: ['id', 'name'], // User details (authors)
      },
      {
        model: Sale, // Sales details
        attributes: ['id', 'price'],
      },
    ],
  });
  res.json(books);
});

// Get All Users with books they are associated with
app.get('/users', async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] }, // Exclude timestamps
    include: [
      {
        model: Book,
        attributes: ['id', 'title'], // Books associated with the user
      },
    ],
  });
  res.json(users);
});

// POST - Create a User
app.post('/users', async (req, res) => {
  const { name } = req.body;

  try {
    const user = await User.create({ name });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

// PUT - Update a User
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    await user.save();

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// DELETE - Delete a User
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// POST - Create a Book and associate it with multiple users
app.post('/books', async (req, res) => {
  const { title, userIds } = req.body; // Accept an array of user IDs

  try {
    const book = await Book.create({ title });
    const users = await User.findAll({ where: { id: userIds } });
    
    await book.addUsers(users); // Associate the book with users

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error creating book' });
  }
});

// PUT - Update a Book
app.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    await book.save();

    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating book' });
  }
});

// DELETE - Delete a Book
app.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.destroy();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book' });
  }
});

// POST - Create a Sale
app.post('/sales', async (req, res) => {
  const { price, bookId } = req.body;

  try {
    const sale = await Sale.create({ price, BookId: bookId });
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Error creating sale' });
  }
});

// PUT - Update a Sale
app.put('/sales/:id', async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  try {
    const sale = await Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    sale.price = price || sale.price;
    await sale.save();

    res.json({ message: 'Sale updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating sale' });
  }
});

// DELETE - Delete a Sale
app.delete('/sales/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sale = await Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    await sale.destroy();
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sale' });
  }
});

// PUT - Assign multiple users to a book
app.put('/books/:id/users', async (req, res) => {
  const { id } = req.params; // BookId
  const { userIds } = req.body; // Array of user IDs

  try {
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const users = await User.findAll({ where: { id: userIds } });
    await book.setUsers(users); // Assign the book to the new users

    res.json({ message: `Book ${id} is now assigned to users: ${userIds}` });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning users to book' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

