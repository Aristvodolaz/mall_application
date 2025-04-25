'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cinema extends Model {
    static associate(models) {
      Cinema.hasMany(models.Screening, {
        foreignKey: 'cinema_id',
        as: 'screenings'
      });
    }

    // Метод для получения URL кинотеатра с текущей датой
    getWebsiteUrl(date = new Date()) {
      const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '/');
      return `${this.website_url}/?date=${formattedDate}&city=${this.city}&facility=${this.facility_id}`;
    }
  }

  Cinema.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    phone: {
      type: DataTypes.STRING
    },
    website_url: {
      type: DataTypes.STRING,
      defaultValue: 'https://проспект-кино.рф',
      validate: {
        isUrl: true
      }
    },
    facility_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'prospekt-dyatkovo'
    },
    image_url: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    total_halls: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      validate: {
        min: 1
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Cinema',
    tableName: 'cinemas',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Cinema;
}; 