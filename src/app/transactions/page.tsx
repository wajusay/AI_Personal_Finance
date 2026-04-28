import Link from "next/link";
import { TransactionType } from "@prisma/client";

import { deleteTransaction } from "@/app/transactions/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateShort, typeLabel } from "@/lib/format";

function toDateStart(value?: string) {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map((v) => Number(v));
  if (!y || !m || !d) return undefined;
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function toDateEnd(value?: string) {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map((v) => Number(v));
  if (!y || !m || !d) return undefined;
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sp = searchParams ?? {};
  const q = typeof sp.q === "string" ? sp.q : "";
  const categoryRaw = typeof sp.category === "string" ? sp.category : "";
  const typeRaw = typeof sp.type === "string" ? sp.type : "";
  const category = categoryRaw === "ALL" ? "" : categoryRaw;
  const type = typeRaw === "ALL" ? "" : typeRaw;
  const from = typeof sp.from === "string" ? sp.from : "";
  const to = typeof sp.to === "string" ? sp.to : "";

  const categories = await prisma.transaction.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  const where = {
    AND: [
      q
        ? {
            OR: [
              { merchant: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
              { accountName: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      category ? { category } : {},
      type === TransactionType.INCOME || type === TransactionType.EXPENSE ? { type } : {},
      from || to
        ? {
            date: {
              gte: toDateStart(from),
              lte: toDateEnd(to),
            },
          }
        : {},
    ],
  };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 250,
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and manage your ledger.
          </p>
        </div>
        <Button asChild>
          <Link href="/transactions/new">Add transaction</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" defaultValue={q} placeholder="Merchant, description, account…" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={type || "ALL"}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="ALL">All</option>
                <option value={TransactionType.EXPENSE}>Expense</option>
                <option value={TransactionType.INCOME}>Income</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                defaultValue={category || "ALL"}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="ALL">All</option>
                {categories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" name="from" type="date" defaultValue={from} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" name="to" type="date" defaultValue={to} />
            </div>

            <div className="flex items-end gap-2 md:col-span-2">
              <Button type="submit">Apply</Button>
              <Button asChild type="button" variant="secondary">
                <Link href="/transactions">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Results <span className="text-muted-foreground">({transactions.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden lg:table-cell">Account</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[160px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No transactions yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => {
                  const amount = Number(t.amount);
                  const isExpense = t.type === "EXPENSE";
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm">{formatDateShort(t.date)}</TableCell>
                      <TableCell className="font-medium">{t.merchant}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {t.description}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {t.accountName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{typeLabel(t.type)}</TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={isExpense ? "text-foreground" : "text-foreground"}>
                          {formatCurrency(amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`/transactions/${t.id}/edit`}>Edit</Link>
                          </Button>
                          <form action={deleteTransaction.bind(null, t.id)}>
                            <Button size="sm" variant="destructive" type="submit">
                              Delete
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

