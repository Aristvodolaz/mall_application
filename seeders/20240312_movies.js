'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('movies', [
      {
        title: 'Дюна: Часть вторая',
        original_title: 'Dune: Part Two',
        description: 'Продолжение истории Пола Атрейдеса, который объединяется с Чани и фрименами, чтобы отомстить за гибель своей семьи.',
        duration: 166,
        release_date: new Date('2024-03-01'),
        end_date: new Date('2024-05-01'),
        poster_url: '/images/movies/dune2.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        rating: 8.7,
        genre: 'Фантастика, Приключения',
        director: 'Дени Вильнёв',
        cast: 'Тимоти Шаламе, Зендея, Ребекка Фергюсон, Джош Бролин',
        age_rating: 12,
        is_active: true,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Переводчик',
        original_title: 'The Interpreter',
        description: 'История афганского переводчика, который работал с американскими войсками и теперь пытается спасти свою семью от талибов.',
        duration: 135,
        release_date: new Date('2024-03-15'),
        end_date: new Date('2024-05-15'),
        poster_url: '/images/movies/interpreter.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=example2',
        rating: 7.9,
        genre: 'Драма, Военный',
        director: 'Гай Ричи',
        cast: 'Джейк Джилленхол, Дар Салим, Джонни Ли Миллер',
        age_rating: 16,
        is_active: true,
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Гражданская оборона',
        original_title: 'Civil Defense',
        description: 'В недалеком будущем группа людей пытается выжить в условиях гражданской войны в США.',
        duration: 128,
        release_date: new Date('2024-03-10'),
        end_date: new Date('2024-05-10'),
        poster_url: '/images/movies/civil-defense.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=example3',
        rating: 7.2,
        genre: 'Триллер, Драма',
        director: 'Алекс Гарленд',
        cast: 'Кирстен Данст, Вагнер Моура, Кейли Спэни',
        age_rating: 18,
        is_active: true,
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Создаем сеансы для фильмов
    const movies = await queryInterface.sequelize.query(
      'SELECT id FROM movies;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const screenings = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Для каждого фильма создаем несколько сеансов
    movies.forEach(movie => {
      // Сеансы на сегодня
      screenings.push({
        movie_id: movie.id,
        date: today,
        time: '10:00',
        hall: 1,
        is_3d: false,
        is_imax: false,
        base_price: 300,
        vip_price: 500,
        student_price: 200,
        child_price: 150,
        seats_layout: JSON.stringify([[1,1,1,1,1,1,1,1,1,1]]),
        created_at: new Date(),
        updated_at: new Date()
      });
      
      screenings.push({
        movie_id: movie.id,
        date: today,
        time: '15:30',
        hall: 2,
        is_3d: true,
        is_imax: false,
        base_price: 400,
        vip_price: 600,
        student_price: 300,
        child_price: 200,
        seats_layout: JSON.stringify([[1,1,1,1,1,1,1,1,1,1]]),
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Сеансы на завтра
      screenings.push({
        movie_id: movie.id,
        date: tomorrow,
        time: '12:15',
        hall: 3,
        is_3d: false,
        is_imax: true,
        base_price: 500,
        vip_price: 800,
        student_price: 400,
        child_price: 300,
        seats_layout: JSON.stringify([[1,1,1,1,1,1,1,1,1,1]]),
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Сеансы на послезавтра
      screenings.push({
        movie_id: movie.id,
        date: dayAfterTomorrow,
        time: '19:45',
        hall: 4,
        is_3d: true,
        is_imax: true,
        base_price: 600,
        vip_price: 1000,
        student_price: 500,
        child_price: 400,
        seats_layout: JSON.stringify([[1,1,1,1,1,1,1,1,1,1]]),
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    await queryInterface.bulkInsert('screenings', screenings);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('screenings', null, {});
    await queryInterface.bulkDelete('movies', null, {});
  }
}; 