import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB

function normalizeText(t: string) {
  return t
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "PDF too large (max 20MB)" }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    const parser = new PDFParse({ data: bytes });
    const data = await parser.getText();
    const text = normalizeText(String(data.text ?? ""));

    // Text-based PDFs only (no OCR in V5).
    if (text.length < 200) {
      return NextResponse.json(
        {
          error:
            "No readable text found. Scanned PDFs are not supported yet (no OCR in V5).",
        },
        { status: 400 },
      );
    }

    // Return raw text; parsing happens next step (deterministic, editable).
    return NextResponse.json({
      uploadedFileName: file.name,
      pages: data.pages?.length ?? null,
      text,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to read PDF. Ensure it is a text-based PDF." },
      { status: 400 },
    );
  }
}

