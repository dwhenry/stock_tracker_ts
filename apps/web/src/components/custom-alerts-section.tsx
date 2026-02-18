import { CustomAlertForm } from "@/components/custom-alert-form";

type Row = {
  id: number;
  quantity: number;
  alertLevel: number | null;
  accessoryId: number;
  accessoryName: string;
};

type Props = {
  customerId: number;
  customAlertStocks: Row[];
  accessories: { id: number; name: string }[];
};

export function CustomAlertsSection({ customerId, customAlertStocks, accessories }: Props) {
  return (
    <>
      <h2 style={{ marginTop: 0 }}>Custom alert levels</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        Override the default low-stock threshold per accessory for this customer.
      </p>
      {customAlertStocks.length > 0 && (
        <div className="table-wrap" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead>
              <tr>
                <th>Accessory</th>
                <th>Current stock</th>
                <th>Alert at</th>
              </tr>
            </thead>
            <tbody>
              {customAlertStocks.map((row) => (
                <tr key={row.id}>
                  <td>{row.accessoryName}</td>
                  <td>{row.quantity}</td>
                  <td>{row.alertLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CustomAlertForm customerId={customerId} accessories={accessories} />
    </>
  );
}
