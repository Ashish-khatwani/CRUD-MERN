const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Assuming db.js exports your sequelize instance
const Book = require('../book'); // Import the Book model

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { timestamps: true });

// Define the many-to-many relationship with Book through UserBooks
User.belongsToMany(Book, { through: 'UserBooks' });

module.exports = User;
