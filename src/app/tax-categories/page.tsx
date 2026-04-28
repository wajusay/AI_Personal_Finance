import Link from "next/link";
import { AuditRiskLevel } from "@prisma/client";

import { createTaxCategory, deleteTaxCategory } from "@/app/tax-categories/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";

export default async function TaxCategoriesPage() {
  const cats = await prisma.taxCategory.findMany({
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tax categories</h1>
          <p className="text-sm text-muted-foreground">
            Organize transactions for tax review. Review with tax advisor.
          </p>
        </div>
        <Link href="/tax-review" className={buttonVariants({ variant: "secondary" })}>
          Tax review
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Add tax category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTaxCategory} className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="e.g. Meals, Auto, Home Office" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input id="schedule" name="schedule" placeholder="e.g. Schedule C" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lineItem">Line item</Label>
              <Input id="lineItem" name="lineItem" placeholder="e.g. Line 24b" />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Optional notes" className="min-h-20" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auditRiskLevel">Audit risk</Label>
              <select
                id="auditRiskLevel"
                name="auditRiskLevel"
                defaultValue={AuditRiskLevel.MEDIUM}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {Object.values(AuditRiskLevel).map((r) => (
                  <option key={r} value={r}>
                    {r.toLowerCase()}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" name="requiresDocumentation" />
                Requires documentation
              </label>
            </div>

            <div className="flex items-end gap-2 md:col-span-4">
              <Button type="submit">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Tax categories <span className="text-muted-foreground">({cats.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="hidden md:table-cell">Line item</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No tax categories yet.
                  </TableCell>
                </TableRow>
              ) : (
                cats.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.schedule ?? "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{c.lineItem ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.auditRiskLevel.toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.requiresDocumentation ? "Required" : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/tax-categories/${c.id}/edit`}
                          className={buttonVariants({ size: "sm", variant: "secondary" })}
                        >
                          Edit
                        </Link>
                        <form action={deleteTaxCategory.bind(null, c.id)}>
                          <Button size="sm" variant="destructive" type="submit">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

