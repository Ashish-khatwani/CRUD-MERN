const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Assuming db.js exports your sequelize instance
const User = require('../user'); // Import the User model

const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { timestamps: true });

// Define the many-to-many relationship with User through UserBooks
Book.belongsToMany(User, { through: 'UserBooks' });

module.exports = Book;
