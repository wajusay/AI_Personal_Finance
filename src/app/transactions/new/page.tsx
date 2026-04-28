import { TransactionType } from "@prisma/client";

import { createTransaction } from "@/app/transactions/actions";
import { Button } from "@/components/ui/button";
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

export default async function NewTransactionPage() {
  const defaultDate = toDateInputValue(new Date());
  const [entities, taxCategories] = await Promise.all([
    prisma.entity.findMany({ orderBy: { name: "asc" } }),
    prisma.taxCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTransaction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={TransactionType.EXPENSE}
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
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="merchant">Merchant</Label>
                <Input id="merchant" name="merchant" placeholder="e.g. Trader Joe's" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g. Groceries" required />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="entityId">Entity (optional)</Label>
                <select
                  id="entityId"
                  name="entityId"
                  defaultValue=""
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
                  defaultValue=""
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
                <Input id="businessPurpose" name="businessPurpose" placeholder="e.g. client meeting" />
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
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="documentationStatus">Documentation status</Label>
              <select
                id="documentationStatus"
                name="documentationStatus"
                defaultValue="UNKNOWN"
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
              <Input id="description" name="description" placeholder="What was this for?" required />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="accountName">Account</Label>
                <Input id="accountName" name="accountName" placeholder="e.g. Chase Checking" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" name="notes" className="min-h-24" placeholder="Optional details" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

