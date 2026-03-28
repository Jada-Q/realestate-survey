import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { identity, buyer_source, agent_time, barrier } = body;

  if (!identity || !Array.isArray(identity) || identity.length === 0) {
    return NextResponse.json({ error: "identity required" }, { status: 400 });
  }

  const supabase = getServerClient();
  const { error } = await supabase.from("responses").insert({
    identity,
    buyer_source: buyer_source || null,
    agent_time: agent_time || null,
    barrier: barrier || null,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
