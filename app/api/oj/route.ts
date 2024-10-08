import { NextRequest } from "next/server";

import { siteConfig } from "@/config/site";

export async function POST(req: NextRequest) {
  return await fetch(siteConfig.benchAPI + "/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: await req.arrayBuffer(),
  });
}
