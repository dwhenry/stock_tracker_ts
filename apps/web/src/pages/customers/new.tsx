import Link from "next/link";
import { CustomerForm } from "@/components/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Add customer</h1>
        <Link href="/customers" className="btn btn-secondary">
          Back
        </Link>
      </div>
      <div className="card">
        <CustomerForm />
      </div>
    </div>
  );
}
