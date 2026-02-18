import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionFromRequest } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const session = await getSessionFromRequest(req);
  if (!session) {
    return res.status(200).json({ user: null });
  }
  return res.status(200).json({
    user: { email: session.email, role: session.role },
  });
}
