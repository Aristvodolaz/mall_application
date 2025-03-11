'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const movies = await queryInterface.sequelize.query(
      'SELECT id FROM movies WHERE is_active = true',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!movies.length) {
      console.log('No active movies found');
      return;
    }

    const screenings = [];
    const currentDate = new Date();
    
    // Базовая схема зала
    const baseSeatsLayout = [];
    for (let row = 1; row <= 10; row++) {
      for (let seat = 1; seat <= 15; seat++) {
        baseSeatsLayout.push({
          row: row.toString(),
          seat: seat.toString()
        });
      }
    }

    const vipSeats = [
      { row: "5", seat: "7" },
      { row: "5", seat: "8" },
      { row: "5", seat: "9" },
      { row: "5", seat: "10" },
      { row: "6", seat: "5" },
      { row: "6", seat: "6" },
      { row: "6", seat: "7" },
      { row: "6", seat: "8" },
      { row: "6", seat: "9" },
      { row: "6", seat: "10" }
    ];

    // Создаем сеансы на следующие 7 дней
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      
      // Сеансы для каждого фильма
      for (const movie of movies) {
        // Утренний сеанс
        screenings.push({
          movie_id: movie.id,
          date: date,
          time: '10:00',
          hall: 1,
          is_3d: false,
          is_imax: false,
          base_price: 250,
          vip_price: 450,
          student_price: 200,
          child_price: 150,
          seats_layout: JSON.stringify(baseSeatsLayout),
          booked_seats: JSON.stringify([]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });

        // Дневной сеанс
        screenings.push({
          movie_id: movie.id,
          date: date,
          time: '14:30',
          hall: 2,
          is_3d: true,
          is_imax: false,
          base_price: 350,
          vip_price: 550,
          student_price: 300,
          child_price: 250,
          seats_layout: JSON.stringify(baseSeatsLayout),
          booked_seats: JSON.stringify([]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });

        // Вечерний сеанс
        screenings.push({
          movie_id: movie.id,
          date: date,
          time: '19:00',
          hall: 3,
          is_3d: true,
          is_imax: true,
          base_price: 450,
          vip_price: 650,
          student_price: 400,
          child_price: 350,
          seats_layout: JSON.stringify(baseSeatsLayout),
          booked_seats: JSON.stringify([]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    await queryInterface.bulkInsert('screenings', screenings, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('screenings', null, {});
  }
}; 