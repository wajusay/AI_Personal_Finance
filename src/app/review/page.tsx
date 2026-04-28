import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approveTransaction, correctTransaction } from "@/app/review/actions";
import { formatCurrency, formatDateShort } from "@/lib/format";

async function getSuggestedCategory(merchant: string) {
  const rows = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      merchant,
      needsReview: false,
      category: { not: "Needs Review" },
      reviewedAt: { not: null },
    },
    _count: { _all: true },
    orderBy: { category: "asc" },
    take: 3,
  });

  rows.sort((a, b) => b._count._all - a._count._all);

  const total = rows.reduce((acc, r) => acc + r._count._all, 0);
  const top = rows[0];
  if (!top || total === 0) return null;

  return {
    category: top.category,
    confidence: Math.min(0.99, top._count._all / total),
  };
}

export default async function ReviewQueuePage() {
  const txs = await prisma.transaction.findMany({
    where: {
      needsReview: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  const suggestions = await Promise.all(
    txs.map(async (t) => ({
      id: t.id,
      suggestion: await getSuggestedCategory(t.merchant),
    })),
  );

  const suggestionMap = new Map(suggestions.map((s) => [s.id, s.suggestion]));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Action Required</h1>
        <p className="text-sm text-muted-foreground">
          Transactions that need review before your ledger is trustworthy.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Review queue <span className="text-muted-foreground">({txs.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Suggested</TableHead>
                <TableHead className="w-[380px]">Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No items right now.
                  </TableCell>
                </TableRow>
              ) : (
                txs.map((t) => {
                  const suggested = suggestionMap.get(t.id);
                  const aiSuggested =
                    t.aiSuggestedCategory && t.aiSuggestedCategory.trim().length > 0
                      ? { category: t.aiSuggestedCategory, confidence: t.confidenceScore ?? null }
                      : null;
                  const confidence =
                    t.confidenceScore ??
                    (aiSuggested?.confidence ?? (suggested ? suggested.confidence : null));
                  const approveCategory =
                    t.category !== "Needs Review"
                      ? t.category
                      : aiSuggested?.category ?? suggested?.category ?? "";
                  const canApprove = approveCategory.trim().length > 0 && approveCategory !== "Needs Review";
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm">{formatDateShort(t.date)}</TableCell>
                      <TableCell className="font-medium">{t.merchant}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {t.description}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(Number(t.amount))}</TableCell>
                      <TableCell>
                        {aiSuggested ? (
                          <div className="grid gap-1">
                            <Badge variant="secondary">{aiSuggested.category}</Badge>
                            <div className="text-xs text-muted-foreground">
                              AI: {t.aiReasoning ? t.aiReasoning : "—"} • Confidence:{" "}
                              {Math.round((confidence ?? 0) * 100)}%
                            </div>
                          </div>
                        ) : suggested ? (
                          <div className="grid gap-1">
                            <Badge variant="secondary">{suggested.category}</Badge>
                            <div className="text-xs text-muted-foreground">
                              Confidence: {Math.round((confidence ?? 0) * 100)}%
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            <Badge variant="secondary">—</Badge>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Confidence: {confidence ? Math.round(confidence * 100) : "—"}%
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-3">
                          <form action={approveTransaction.bind(null, t.id)} className="flex items-center gap-2">
                            <input type="hidden" name="category" value={approveCategory} />
                            <Button size="sm" type="submit" variant="secondary" disabled={!canApprove}>
                              Approve
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              {canApprove ? (
                                <>
                                  Apply{" "}
                                  <span className="font-medium text-foreground">{approveCategory}</span>
                                </>
                              ) : (
                                <>No suggestion yet — use Correct to set a category</>
                              )}
                            </span>
                          </form>

                          <form action={correctTransaction.bind(null, t.id)} className="grid gap-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="grid gap-1.5">
                                <Label htmlFor={`category-${t.id}`}>Correct category</Label>
                                <Input
                                  id={`category-${t.id}`}
                                  name="category"
                                  defaultValue={aiSuggested?.category ?? suggested?.category ?? ""}
                                  placeholder="e.g. Groceries"
                                  required
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <Button size="sm" type="submit">
                                  Save
                                </Button>
                              </div>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                              <input type="checkbox" name="applyRule" />
                              Apply this rule to similar future transactions?
                            </label>
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

