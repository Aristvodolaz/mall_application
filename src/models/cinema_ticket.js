'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CinemaTicket extends Model {
    static associate(models) {
      CinemaTicket.belongsTo(models.Screening, {
        foreignKey: 'screening_id',
        as: 'screening'
      });
      CinemaTicket.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  CinemaTicket.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    screening_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'screenings',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    seat_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    row_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('reserved', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'reserved'
    },
    qr_code: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'CinemaTicket',
    tableName: 'cinema_tickets',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (ticket) => {
        // Генерация QR-кода при создании билета
        if (!ticket.qr_code) {
          ticket.qr_code = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
      }
    }
  });

  return CinemaTicket;
}; 