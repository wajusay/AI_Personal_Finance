import Link from "next/link";
import { AlertStatus } from "@prisma/client";

import { dismissAlert, resolveAlert, scanAlerts } from "@/app/alerts/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateShort } from "@/lib/format";

export default async function AlertsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const statusParam = searchParams?.status;
  const status =
    statusParam === AlertStatus.DISMISSED || statusParam === AlertStatus.RESOLVED
      ? statusParam
      : AlertStatus.OPEN;

  const alerts = await prisma.alert.findMany({
    where: { status },
    include: { transaction: true },
    orderBy: [{ updatedAt: "desc" }],
    take: 300,
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Recurring and anomaly signals based on historical averages.
          </p>
        </div>
        <div className="flex gap-2">
          <form action={scanAlerts}>
            <Button type="submit">Scan</Button>
          </form>
          <Link href="/forecast" className={buttonVariants({ variant: "secondary" })}>
            Forecast
          </Link>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/alerts?status=OPEN"
          className={buttonVariants({ variant: status === "OPEN" ? "default" : "secondary", size: "sm" })}
        >
          Open
        </Link>
        <Link
          href="/alerts?status=DISMISSED"
          className={buttonVariants({ variant: status === "DISMISSED" ? "default" : "secondary", size: "sm" })}
        >
          Dismissed
        </Link>
        <Link
          href="/alerts?status=RESOLVED"
          className={buttonVariants({ variant: status === "RESOLVED" ? "default" : "secondary", size: "sm" })}
        >
          Resolved
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            {status.toLowerCase()} alerts{" "}
            <span className="text-muted-foreground">({alerts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Explanation</TableHead>
                <TableHead>Suggested action</TableHead>
                <TableHead className="w-[220px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No alerts.
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Badge variant="secondary">{a.type.replaceAll("_", " ").toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.transaction ? (
                        <div className="grid gap-0.5">
                          <div className="font-medium text-foreground">{a.transaction.merchant}</div>
                          <div>
                            {formatDateShort(a.transaction.date)} • {formatCurrency(Number(a.transaction.amount))}
                          </div>
                          <Link
                            href={`/transactions/${a.transaction.id}/edit`}
                            className="text-xs underline underline-offset-4"
                          >
                            View
                          </Link>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{a.explanation}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.suggestedAction}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {a.status === "OPEN" && (
                          <>
                            <form action={resolveAlert.bind(null, a.id)}>
                              <Button size="sm" variant="secondary" type="submit">
                                Resolve
                              </Button>
                            </form>
                            <form action={dismissAlert.bind(null, a.id)}>
                              <Button size="sm" variant="destructive" type="submit">
                                Dismiss
                              </Button>
                            </form>
                          </>
                        )}
                        {a.status !== "OPEN" && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
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

