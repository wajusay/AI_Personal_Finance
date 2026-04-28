import Link from "next/link";

import { createRule, deleteRule } from "@/app/rules/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";

export default async function RulesPage() {
  const rules = await prisma.categoryRule.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorization rules</h1>
          <p className="text-sm text-muted-foreground">
            Deterministic matching: if merchant/description contains match text, apply category.
          </p>
        </div>
        <Link href="/import" className={buttonVariants({ variant: "secondary" })}>
          Import CSV
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Add rule</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createRule} className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="matchText">Match text</Label>
              <Input id="matchText" name="matchText" placeholder="e.g. trader joe" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="e.g. Groceries" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Input id="priority" name="priority" type="number" defaultValue="100" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transactionType">Transaction type</Label>
              <select
                id="transactionType"
                name="transactionType"
                defaultValue="ALL"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="ALL">All</option>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div className="flex items-end gap-2 md:col-span-3">
              <Button type="submit">Add rule</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Rules <span className="text-muted-foreground">({rules.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Priority</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No rules yet. Add one above.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.matchText}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.transactionType ?? "All"}
                    </TableCell>
                    <TableCell className="text-right font-medium">{r.priority}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/rules/${r.id}/edit`}
                          className={buttonVariants({ size: "sm", variant: "secondary" })}
                        >
                          Edit
                        </Link>
                        <form action={deleteRule.bind(null, r.id)}>
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

