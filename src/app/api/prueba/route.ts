import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Receives the trial-request form. For now we just log the submission to
// the server console so we can wire it up to email/CRM later without
// changing the client.
export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const fields: Record<string, unknown> = {};
    for (const [key, value] of fd.entries()) {
      if (value instanceof File) {
        fields[key] = {
          name: value.name,
          size: value.size,
          type: value.type,
        };
      } else {
        // Most fields are JSON-stringified arrays/strings on the client.
        try {
          fields[key] = JSON.parse(value as string);
        } catch {
          fields[key] = value;
        }
      }
    }

    console.log("[prueba] new trial request", JSON.stringify(fields, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[prueba] error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
