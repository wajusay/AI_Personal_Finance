import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { detectRecurringGroups } from "@/lib/detect/recurring";

function startOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function addMonthsUTC(d: Date, months: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
}

export default async function ForecastPage() {
  const now = new Date();
  const start = addMonthsUTC(startOfMonthUTC(now), -6);

  const txs = await prisma.transaction.findMany({
    where: { date: { gte: start } },
    orderBy: [{ date: "asc" }],
  });

  const byMonth = new Map<string, { income: number; expenses: number }>();
  for (const t of txs) {
    const d = t.date;
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const row = byMonth.get(key) ?? { income: 0, expenses: 0 };
    const amt = Number(t.amount);
    if (t.type === "INCOME") row.income += amt;
    else row.expenses += amt;
    byMonth.set(key, row);
  }

  const months = Array.from(byMonth.entries()).sort(([a], [b]) => a.localeCompare(b));
  const last3 = months.slice(-3);
  const avgIncome =
    last3.reduce((acc, [, v]) => acc + v.income, 0) / Math.max(1, last3.length);
  const avgExpenses =
    last3.reduce((acc, [, v]) => acc + v.expenses, 0) / Math.max(1, last3.length);
  const projectedNet = avgIncome - avgExpenses;

  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 35)).getTime();
  const recurring = detectRecurringGroups(txs)
    .filter((g) => g.nextDueDate.getTime() <= cutoff)
    .slice(0, 15);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Forecast</h1>
          <p className="text-sm text-muted-foreground">
            Simple projection using recent historical averages.
          </p>
        </div>
        <Link href="/alerts" className={buttonVariants({ variant: "secondary" })}>
          Alerts
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg monthly income (last 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(avgIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg monthly expenses (last 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(avgExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projected net cash flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(projectedNet)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Monthly history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Not enough data yet.
                  </TableCell>
                </TableRow>
              ) : (
                months.slice(-12).map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell className="font-medium">{k}</TableCell>
                    <TableCell className="text-right">{formatCurrency(v.income)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(v.expenses)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(v.income - v.expenses)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Upcoming recurring bills (next ~35 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cadence</TableHead>
                <TableHead className="text-right">Typical amount</TableHead>
                <TableHead>Next due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurring.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No recurring items detected yet.
                  </TableCell>
                </TableRow>
              ) : (
                recurring.map((r) => (
                  <TableRow key={r.key}>
                    <TableCell className="font-medium">{r.merchant}</TableCell>
                    <TableCell className="text-muted-foreground">{r.category}</TableCell>
                    <TableCell className="text-muted-foreground">
                      ~{r.cadenceDays}d ({r.kind})
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(r.avgAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.nextDueDate.toISOString().slice(0, 10)}
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

