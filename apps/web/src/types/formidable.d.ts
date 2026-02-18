declare module "formidable" {
  import type { IncomingMessage } from "node:http";
  export class IncomingForm {
    parse(req: IncomingMessage): Promise<[Record<string, string | string[]>, Record<string, unknown | unknown[]>]>;
    parse(req: IncomingMessage, callback: (err: Error | null, fields: unknown, files: unknown) => void): void;
  }
}
