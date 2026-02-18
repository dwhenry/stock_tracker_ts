import type { NextApiRequest, NextApiResponse } from "next";
import { deleteSessionCookieRes } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  deleteSessionCookieRes(res);
  res.redirect(302, "/login");
}
