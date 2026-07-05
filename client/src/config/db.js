require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: true,
    timezone: process.env.DB_TIMEZONE || 'Asia/Kolkata',
    dialectOptions: {
      useUTC: false,
    },
    define: {
      freezeTableName: true,
      timestamps: true,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL database connected successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the PostgreSQL database:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  sequelize,
  DataTypes,
  Op,
};
