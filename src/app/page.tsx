import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateShort } from "@/lib/format";

export default async function DashboardPage() {
  const [incomeAgg, expenseAgg, recent, byCategory] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { type: "EXPENSE" },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 8,
    }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
  const net = totalIncome - totalExpenses;

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            A simple, private ledger overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/transactions"
            className={buttonVariants({ variant: "secondary" })}
          >
            View transactions
          </Link>
          <Link href="/transactions/new" className={buttonVariants()}>
            Add
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net cash flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(net)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Recent transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Date</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      No transactions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm">{formatDateShort(t.date)}</TableCell>
                      <TableCell className="font-medium">{t.merchant}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(t.amount))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Manage your ledger</div>
              <Link
                href="/transactions"
                className={buttonVariants({ size: "sm", variant: "secondary" })}
              >
                Open transactions
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Spending by category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {byCategory.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No expense data yet.
                </div>
              ) : (
                byCategory.map((row) => {
                  const value = Number(row._sum.amount ?? 0);
                  return (
                    <div key={row.category} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{row.category}</div>
                        <div className="text-xs text-muted-foreground">Expense</div>
                      </div>
                      <div className="text-sm font-semibold">{formatCurrency(value)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">V1 scope</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Manual ledger + clean dashboard. No auth. No AI. All data stays local.
        </CardContent>
      </Card>
    </div>
  );
}
