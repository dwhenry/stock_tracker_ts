import { sql } from "drizzle-orm";
import {
  bigint,
  customType,
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

const longblob = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "longblob";
  },
  fromDriver(value: Buffer): Buffer {
    return value;
  },
  toDriver(value: Buffer): Buffer {
    return value;
  },
});

export const userRoleEnum = ["basic", "admin"] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const adjustmentTypeEnum = [
  "initial",
  "addition",
  "removal",
  "checkout",
] as const;
export type AdjustmentType = (typeof adjustmentTypeEnum)[number];

// ---------------------------------------------------------------------------
// Users & auth
// ---------------------------------------------------------------------------

export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", userRoleEnum).notNull(),
  invitationToken: varchar("invitation_token", { length: 255 }),
  invitationSentAt: datetime("invitation_sent_at", { mode: "date" }),
  createdAt: datetime("created_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
  createdAt: datetime("created_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// Blobs (DB-backed file storage for accessory images)
// ---------------------------------------------------------------------------

export const blobs = mysqlTable("blobs", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  data: longblob("data").notNull(),
  contentType: varchar("content_type", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 512 }).notNull(),
  createdAt: datetime("created_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// Customers & accessories
// ---------------------------------------------------------------------------

export const customers = mysqlTable("customers", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: datetime("created_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export const accessories = mysqlTable("accessories", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  barcode: varchar("barcode", { length: 255 }).notNull().unique(),
  alertWhenStockBelow: int("alert_when_stock_below").notNull(),
  imageBlobId: bigint("image_blob_id", { mode: "number" }).references(
    () => blobs.id,
    { onDelete: "set null" }
  ),
  createdAt: datetime("created_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// Customer stocks & adjustments
// ---------------------------------------------------------------------------

export const customerStocks = mysqlTable(
  "customer_stocks",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    customerId: bigint("customer_id", { mode: "number" })
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    accessoryId: bigint("accessory_id", { mode: "number" })
      .notNull()
      .references(() => accessories.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull(),
    alertLevel: int("alert_level"), // override; null = use accessory default
    createdAt: datetime("created_at", { mode: "date" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at", { mode: "date" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    customerStocksCustomerAccessoryUnique: unique(
      "customer_stocks_customer_accessory_unique"
    ).on(t.customerId, t.accessoryId),
  })
);

export const stockAdjustments = mysqlTable("stock_adjustments", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  customerStockId: bigint("customer_stock_id", { mode: "number" })
    .notNull()
    .references(() => customerStocks.id, { onDelete: "cascade" }),
  quantityChange: int("quantity_change").notNull(),
  adjustmentType: mysqlEnum("adjustment_type", adjustmentTypeEnum).notNull(),
  notes: varchar("notes", { length: 512 }),
  createdAt: datetime("created_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
