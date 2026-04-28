import { notFound } from "next/navigation";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

import { updateTransaction } from "@/app/transactions/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";

function toDateInputValue(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [t, entities, taxCategories] = await Promise.all([
    prisma.transaction.findUnique({ where: { id } }),
    prisma.entity.findMany({ orderBy: { name: "asc" } }),
    prisma.taxCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!t) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateTransaction.bind(null, t.id)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={toDateInputValue(t.date)} required />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={t.type}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value={TransactionType.EXPENSE}>Expense</option>
                  <option value={TransactionType.INCOME}>Income</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  defaultValue={String(t.amount)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="merchant">Merchant</Label>
                <Input id="merchant" name="merchant" defaultValue={t.merchant} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" defaultValue={t.category} required />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="entityId">Entity (optional)</Label>
                <select
                  id="entityId"
                  name="entityId"
                  defaultValue={t.entityId ?? ""}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">—</option>
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxCategoryId">Tax category (optional)</Label>
                <select
                  id="taxCategoryId"
                  name="taxCategoryId"
                  defaultValue={t.taxCategoryId ?? ""}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">—</option>
                  {taxCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="businessPurpose">Business purpose (optional)</Label>
                <Input id="businessPurpose" name="businessPurpose" defaultValue={t.businessPurpose ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deductiblePercentage">Deductible % (optional)</Label>
                <Input
                  id="deductiblePercentage"
                  name="deductiblePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={t.deductiblePercentage ?? ""}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="documentationStatus">Documentation status</Label>
              <select
                id="documentationStatus"
                name="documentationStatus"
                defaultValue={t.documentationStatus}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="NOT_NEEDED">Not needed</option>
                <option value="NEEDED">Needed</option>
                <option value="UPLOADED">Uploaded</option>
                <option value="MISSING">Missing</option>
              </select>
              <p className="text-xs text-muted-foreground">Review with tax advisor.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={t.description} required />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="accountName">Account</Label>
                <Input id="accountName" name="accountName" defaultValue={t.accountName} required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" name="notes" className="min-h-24" defaultValue={t.notes ?? ""} />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link
                href="/transactions"
                className={buttonVariants({ variant: "secondary" })}
              >
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

