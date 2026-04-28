import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImportClient from "@/app/import/ui/import-client";
import { prisma } from "@/lib/db";

export default async function ImportPage() {
  const ruleCount = await prisma.categoryRule.count();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import CSV</h1>
        <p className="text-sm text-muted-foreground">
          Upload a bank export, map columns, preview, then save.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Import</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportClient ruleCount={ruleCount} />
        </CardContent>
      </Card>
    </div>
  );
}

