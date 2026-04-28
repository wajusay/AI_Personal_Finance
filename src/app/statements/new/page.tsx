import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatementUploadClient from "@/app/statements/new/ui/statement-upload-client";

export default function NewStatementPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload statement (PDF)</h1>
        <p className="text-sm text-muted-foreground">
          V5 supports text-based PDFs only (no scanned/OCR yet).
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Statement upload</CardTitle>
        </CardHeader>
        <CardContent>
          <StatementUploadClient />
        </CardContent>
      </Card>
    </div>
  );
}

