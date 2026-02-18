import type { IncomingMessage } from "node:http";
import type { NextApiRequest } from "next";

export type ParsedForm = {
  fields: Record<string, string>;
  files: Record<string, { buffer: Buffer; type: string; name: string } | undefined>;
};

/**
 * Parse multipart/form-data using formidable. Use with config.api.bodyParser = false.
 */
function toRecord<T>(m: unknown): Record<string, T> {
  if (m && typeof m === "object" && !Array.isArray(m)) {
    if (m instanceof Map) return Object.fromEntries(m as Map<string, T>);
    return m as Record<string, T>;
  }
  return {};
}

export async function parseForm(
  req: NextApiRequest | IncomingMessage
): Promise<ParsedForm> {
  const { IncomingForm } = await import("formidable");
  const form = new IncomingForm();
  const [rawFields, rawFiles] = await form.parse(req as IncomingMessage);
  const fieldsObj = toRecord<string | string[]>(rawFields);
  const filesObj = toRecord<unknown>(rawFiles);
  const outFields: Record<string, string> = {};
  for (const [k, v] of Object.entries(fieldsObj)) {
    const val = Array.isArray(v) ? v[0] : (v as string);
    outFields[k] = val ?? "";
  }
  const outFiles: ParsedForm["files"] = {};
  const { readFile } = await import("node:fs/promises");
  for (const [key, list] of Object.entries(filesObj)) {
    const first = Array.isArray(list) ? list[0] : list;
    const entry = first && typeof first === "object" && first !== null && "filepath" in first ? first as { filepath: string; mimetype?: string; originalFilename?: string } : null;
    if (!entry?.filepath) continue;
    const buffer = await readFile(entry.filepath);
    outFiles[key] = {
      buffer,
      type: entry.mimetype || "application/octet-stream",
      name: entry.originalFilename || "file",
    };
  }
  return { fields: outFields, files: outFiles };
}

/** Get a single field from parsed form or req.body (for JSON). */
export function getField(
  body: Record<string, unknown> | null,
  fields: Record<string, string> | null,
  name: string
): string | undefined {
  if (fields && fields[name] !== undefined) return fields[name];
  if (body && typeof body[name] === "string") return body[name] as string;
  return undefined;
}

/** Get numeric field. */
export function getNumber(
  body: Record<string, unknown> | null,
  fields: Record<string, string> | null,
  name: string
): number {
  const v = getField(body, fields, name);
  if (v === undefined || v === "") return NaN;
  return Number(v);
}
