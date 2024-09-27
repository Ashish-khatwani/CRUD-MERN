// sale.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, Book) => {
  const Sale = sequelize.define('Sale', {
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });

  // One-to-Many: A book has many sales
  Book.hasMany(Sale);
  Sale.belongsTo(Book);

  return Sale;
};
