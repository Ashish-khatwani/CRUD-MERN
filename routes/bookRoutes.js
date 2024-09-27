const express = require('express');
const router = express.Router();
const Book = require('../book');
const User = require('../user');

// POST - Assign multiple users to a book
router.post('/:id/users', async (req, res) => {
  const { id } = req.params; // bookId
  const { userIds } = req.body; // Array of userIds

  try {
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const users = await User.findAll({
      where: {
        id: userIds,
      },
    });

    if (users.length !== userIds.length) {
      return res.status(404).json({ message: 'One or more users not found' });
    }

    await book.addUsers(users); // Assign multiple users to the book

    res.json({ message: `Users assigned to Book ${id}` });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning users to book' });
  }
});

module.exports = router;
