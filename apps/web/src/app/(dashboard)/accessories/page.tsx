import Link from "next/link";
import { db } from "@/lib/db";
import { accessories } from "@stock-tracker/database/schema";
import { asc } from "drizzle-orm";
import { DeleteAccessoryButton } from "./delete-accessory-button";

export default async function AccessoriesPage() {
  const list = await db
    .select()
    .from(accessories)
    .orderBy(asc(accessories.name));

  return (
    <div className="container">
      <div className="page-header">
        <h1>Accessories</h1>
        <Link href="/accessories/new" className="btn btn-primary">
          Add accessory
        </Link>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Barcode</th>
                <th>Alert when below</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    No accessories yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                list.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.imageBlobId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/blobs/${a.imageBlobId}`}
                          alt=""
                          width={48}
                          height={48}
                          style={{ objectFit: "cover", borderRadius: 4 }}
                        />
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td>{a.name}</td>
                    <td>{a.barcode}</td>
                    <td>{a.alertWhenStockBelow}</td>
                    <td>
                      <Link
                        href={`/accessories/${a.id}/edit`}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </Link>{" "}
                      <DeleteAccessoryButton id={a.id} name={a.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
