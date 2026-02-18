import Link from "next/link";

export const SummaryCard = ({
  name,
  image,
  count,
  href,
  linkText,
}: {
  name: string;
  image: string;
  count: number | undefined;
  href: string;
  linkText?: string;
}) => {
  return (
    <div
      className="card"
      style={{
        position: "relative",
        marginBottom: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <span style={{ fontSize: "2rem" }}>{image}</span>
        <div>
          <span
            style={{
              display: "block",
              fontSize: "1.5rem",
              fontWeight: 600,
            }}
          >
            {count ?? 0}
          </span>
          <span style={{ color: "var(--text-muted)" }}>{name}</span>
        </div>
        <Link
          href={href}
          className="btn btn-secondary btn-sm"
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            marginLeft: "auto",
            backgroundColor: "none",
          }}
        >
          {linkText ?? "Manage"}
        </Link>
      </div>
    </div>
  );
};
