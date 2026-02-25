import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'subscriptions.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      cost REAL NOT NULL,
      billing_cycle TEXT NOT NULL CHECK(billing_cycle IN ('monthly', 'yearly')),
      status TEXT NOT NULL CHECK(status IN ('active', 'trial', 'cancelled')),
      trial_end_date TEXT,
      cancellation_date TEXT,
      start_date TEXT NOT NULL
    );
  `);

  // Seed data if the table is empty
  const count = database.prepare('SELECT COUNT(*) as count FROM subscriptions').get() as { count: number };
  if (count.count === 0) {
    const insert = database.prepare(`
      INSERT INTO subscriptions (name, category, cost, billing_cycle, status, trial_end_date, cancellation_date, start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = database.transaction(() => {
      insert.run('Netflix', 'Streaming', 10.00, 'monthly', 'active', null, null, '2023-01-01');
      insert.run('Spotify Annual', 'Streaming', 120.00, 'yearly', 'active', null, null, '2023-03-15');
      insert.run('Gym Membership', 'Fitness', 30.00, 'monthly', 'active', null, null, '2023-05-01');
      insert.run('VS Code Pro', 'Software', 20.00, 'monthly', 'active', null, null, '2023-06-01');
      insert.run('Disney+', 'Streaming', 8.00, 'monthly', 'trial', '2025-08-01', null, '2025-07-01');
      insert.run('Old Service', 'Software', 15.00, 'monthly', 'cancelled', null, '2024-01-01', '2023-01-01');
    });
    insertMany();
  }
}
