import Link from "next/link";
import { DeleteStockButton } from "@/components/delete-stock-button";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/db";
import { customers, customerStocks, accessories } from "@stock-tracker/database/schema";
import { eq } from "drizzle-orm";

type StockRow = {
  id: number;
  quantity: number;
  alertLevel: number | null;
  accessoryId: number;
  accessoryName: string;
  alertWhenStockBelow: number;
};

type Props = { id: number; customerName: string; stocks: StockRow[] };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const id = Number(context.params?.id);
  if (!Number.isFinite(id)) return { notFound: true };

  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  if (!customer) return { notFound: true };

  const stocks = await db
    .select({
      id: customerStocks.id,
      quantity: customerStocks.quantity,
      alertLevel: customerStocks.alertLevel,
      accessoryId: customerStocks.accessoryId,
      accessoryName: accessories.name,
      alertWhenStockBelow: accessories.alertWhenStockBelow,
    })
    .from(customerStocks)
    .innerJoin(accessories, eq(customerStocks.accessoryId, accessories.id))
    .where(eq(customerStocks.customerId, id))
    .orderBy(accessories.name);

  return {
    props: {
      id,
      customerName: customer.name,
      stocks: stocks as StockRow[],
    },
  };
};

function effectiveThreshold(row: { alertLevel: number | null; alertWhenStockBelow: number }) {
  return row.alertLevel ?? row.alertWhenStockBelow;
}

function isLow(row: StockRow) {
  return row.quantity <= effectiveThreshold(row);
}

export default function CustomerStocksPage({ id, customerName, stocks }: Props) {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Stock for {customerName}</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href={`/customers/${id}/checkout`} className="btn btn-primary">
            Checkout
          </Link>
          <Link href={`/customers/${id}/stocks/new`} className="btn btn-secondary">
            Add stock
          </Link>
          <Link href={`/customers/${id}/edit`} className="btn btn-secondary">
            Edit customer
          </Link>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Accessory</th>
                <th>Quantity</th>
                <th>Alert threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    No stock records. Add one to get started.
                  </td>
                </tr>
              ) : (
                stocks.map((row) => {
                  const threshold = effectiveThreshold(row);
                  const low = isLow(row);
                  return (
                    <tr key={row.id}>
                      <td>{row.accessoryName}</td>
                      <td className={low ? "danger" : undefined}>{row.quantity}</td>
                      <td>{threshold}</td>
                      <td>{low ? "Low" : "OK"}</td>
                      <td>
                        <Link
                          href={`/customers/${id}/stocks/${row.id}/edit`}
                          className="btn btn-sm btn-secondary"
                        >
                          Edit
                        </Link>{" "}
                        <DeleteStockButton
                          customerId={id}
                          stockId={row.id}
                          accessoryName={row.accessoryName}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
