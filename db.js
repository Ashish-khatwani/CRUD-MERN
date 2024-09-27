const { Sequelize } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize('sqlite::memory:'); // Adjust for your database

module.exports = sequelize;
