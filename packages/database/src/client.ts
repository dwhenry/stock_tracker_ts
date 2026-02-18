import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? "mysql://davidhenry:1980@localhost:3306/stock_tracker";

const pool = mysql.createPool(connectionString);

export const db = drizzle(pool, { schema, mode: "default" });
export type Database = typeof db;
