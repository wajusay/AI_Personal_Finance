import Link from "next/link";
import { notFound } from "next/navigation";
import { AuditRiskLevel } from "@prisma/client";

import { updateTaxCategory } from "@/app/tax-categories/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";

export default async function EditTaxCategoryPage({ params }: { params: { id: string } }) {
  const c = await prisma.taxCategory.findUnique({ where: { id: params.id } });
  if (!c) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit tax category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateTaxCategory.bind(null, c.id)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={c.name} required />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input id="schedule" name="schedule" defaultValue={c.schedule ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lineItem">Line item</Label>
                <Input id="lineItem" name="lineItem" defaultValue={c.lineItem ?? ""} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={c.description ?? ""} className="min-h-24" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="auditRiskLevel">Audit risk</Label>
                <select
                  id="auditRiskLevel"
                  name="auditRiskLevel"
                  defaultValue={c.auditRiskLevel}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {Object.values(AuditRiskLevel).map((r) => (
                    <option key={r} value={r}>
                      {r.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Documentation</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="requiresDocumentation" defaultChecked={c.requiresDocumentation} />
                  Requires documentation
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Link href="/tax-categories" className={buttonVariants({ variant: "secondary" })}>
                Cancel
              </Link>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

