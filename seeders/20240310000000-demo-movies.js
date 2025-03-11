'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const movies = [
      {
        title: 'Дюна: Часть вторая',
        original_title: 'Dune: Part Two',
        description: 'Продолжение истории Пола Атрейдеса, который объединяется с Чани и фрименами, чтобы отомстить тем, кто уничтожил его семью.',
        duration: 166,
        release_date: '2024-02-29',
        end_date: '2024-04-30',
        poster_url: '/images/movies/dune2.jpg',
        trailer_url: 'https://www.youtube.com/embed/qRRqZPyHcO4',
        rating: 8.5,
        genre: 'Фантастика, Приключения',
        director: 'Дени Вильнёв',
        cast: 'Тимоти Шаламе, Зендея, Ребекка Фергюсон, Джош Бролин',
        age_rating: 12,
        is_active: true,
        is_featured: true,
        is_new: true,
        coming_soon: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Переводчик',
        original_title: 'The Interpreter',
        description: 'История афганского переводчика, который помогал американским войскам и теперь пытается спасти свою семью.',
        duration: 123,
        release_date: '2024-03-07',
        end_date: '2024-04-15',
        poster_url: '/images/movies/interpreter.jpg',
        trailer_url: 'https://www.youtube.com/embed/example2',
        rating: 7.8,
        genre: 'Драма, Военный',
        director: 'Гай Ричи',
        cast: 'Джейк Джилленхол, Дар Салим, Энтони Старр',
        age_rating: 16,
        is_active: true,
        is_featured: false,
        is_new: true,
        coming_soon: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Гражданская оборона',
        original_title: 'Civil Defense',
        description: 'В результате техногенной катастрофы Москва оказывается отрезана от внешнего мира. Группа спасателей пытается предотвратить еще большую трагедию.',
        duration: 137,
        release_date: '2024-03-14',
        end_date: '2024-04-30',
        poster_url: '/images/movies/civil-defense.jpg',
        trailer_url: 'https://www.youtube.com/embed/example3',
        rating: 7.2,
        genre: 'Катастрофа, Драма',
        director: 'Алексей Нужный',
        cast: 'Александр Петров, Андрей Смоляков, Дарья Мороз',
        age_rating: 12,
        is_active: true,
        is_featured: true,
        is_new: true,
        coming_soon: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('movies', movies, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('movies', null, {});
  }
}; 