import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'SmartStudy.db',
    location: 'default',
  },
  () => console.log('Database opened'),
  error => console.log('DB Error:', error)
);

export default db;