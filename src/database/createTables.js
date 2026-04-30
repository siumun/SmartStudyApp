import db from './db';

const createTables = () => {
  db.transaction(t => {

    t.executeSql(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date TEXT,
        status TEXT
      );
    `);

    t.executeSql(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        lat REAL,
        lng REAL
      );
    `);

    t.executeSql(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
        location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
        duration INTEGER
      );
    `);

  },
  err => console.log('CREATE TABLE ERROR:', err),
  () => console.log('Tables ready'),
  );
};

export default createTables;