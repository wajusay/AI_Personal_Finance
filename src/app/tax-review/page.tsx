import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateShort } from "@/lib/format";

function classify(tx: {
  category: string;
  taxCategoryName: string | null;
  amount: number;
  needsReview: boolean;
  deductiblePercentage: number | null;
}) {
  const cat = (tx.taxCategoryName ?? tx.category ?? "").toLowerCase();
  const flags: string[] = [];

  const contains = (needle: string) => cat.includes(needle);

  if (contains("meal")) flags.push("Meals");
  if (contains("auto") || contains("vehicle") || contains("mileage")) flags.push("Auto");
  if (contains("home office") || contains("home-office")) flags.push("Home office");
  if (contains("utilit") || contains("internet") || contains("phone")) flags.push("Utilities");

  if (tx.needsReview && tx.amount >= 200) flags.push("Large uncategorized expense");

  if (tx.deductiblePercentage !== null && tx.deductiblePercentage > 0 && tx.deductiblePercentage < 100) {
    flags.push("Mixed-use expense");
  }

  return flags;
}

export default async function TaxReviewPage() {
  const txs = await prisma.transaction.findMany({
    where: {
      OR: [
        { taxCategoryId: { not: null } },
        { deductiblePercentage: { not: null } },
        { needsReview: true },
      ],
    },
    include: {
      entity: true,
      taxCategory: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 300,
  });

  const flagged = txs
    .map((t) => {
      const amount = Number(t.amount);
      const flags = classify({
        category: t.category,
        taxCategoryName: t.taxCategory?.name ?? null,
        amount,
        needsReview: t.needsReview,
        deductiblePercentage: t.deductiblePercentage ?? null,
      });
      return { t, amount, flags };
    })
    .filter((x) => x.flags.length > 0);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tax review</h1>
          <p className="text-sm text-muted-foreground">
            Flags potential tax-review items. Review with tax advisor. This app does not provide tax advice.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/entities" className={buttonVariants({ variant: "secondary" })}>
            Entities
          </Link>
          <Link href="/tax-categories" className={buttonVariants({ variant: "secondary" })}>
            Tax categories
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Flagged transactions <span className="text-muted-foreground">({flagged.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[120px] text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flagged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No flagged items found.
                  </TableCell>
                </TableRow>
              ) : (
                flagged.map(({ t, amount, flags }) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm">{formatDateShort(t.date)}</TableCell>
                    <TableCell className="font-medium">{t.merchant}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {t.description}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.entity?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.taxCategory?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {flags.map((f) => (
                          <Badge key={f} variant="secondary">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(amount)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/transactions/${t.id}/edit`}
                        className={buttonVariants({ size: "sm", variant: "secondary" })}
                      >
                        Edit
                      </Link>
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

