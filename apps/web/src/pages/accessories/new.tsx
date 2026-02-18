import Link from "next/link";
import { AccessoryForm } from "@/components/accessory-form";

export default function NewAccessoryPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Add accessory</h1>
        <Link href="/accessories" className="btn btn-secondary">
          Back
        </Link>
      </div>
      <div className="card">
        <AccessoryForm />
      </div>
    </div>
  );
}
