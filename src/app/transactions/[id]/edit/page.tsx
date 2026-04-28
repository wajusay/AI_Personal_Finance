import { notFound } from "next/navigation";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

import { updateTransaction } from "@/app/transactions/actions";
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

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = await prisma.transaction.findUnique({ where: { id } });
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
              <Button asChild type="button" variant="secondary">
                <Link href="/transactions">Cancel</Link>
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

