import { AccessoryCustomAlertForm } from "@/components/accessory-custom-alert-form";

type Row = {
  id: number;
  quantity: number;
  alertLevel: number | null;
  customerId: number;
  customerName: string;
};

type Props = {
  accessoryId: number;
  customAlertStocks: Row[];
  customers: { id: number; name: string }[];
};

export function AccessoryCustomAlertsSection({ accessoryId, customAlertStocks, customers }: Props) {
  return (
    <>
      <h2 style={{ marginTop: 0 }}>Custom alert levels (per customer)</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        Customers who have a custom threshold for this accessory.
      </p>
      {customAlertStocks.length > 0 && (
        <div className="table-wrap" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Current stock</th>
                <th>Alert at</th>
              </tr>
            </thead>
            <tbody>
              {customAlertStocks.map((row) => (
                <tr key={row.id}>
                  <td>{row.customerName}</td>
                  <td>{row.quantity}</td>
                  <td>{row.alertLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AccessoryCustomAlertForm accessoryId={accessoryId} customers={customers} />
    </>
  );
}
