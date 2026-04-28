"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ExtractResponse = {
  error?: string;
  uploadedFileName: string;
  pages: number | null;
  text: string;
};

type Parsed = {
  institutionName: string | null;
  accountName: string | null;
  statementStartDate: string | null;
  statementEndDate: string | null;
  openingBalance: number | null;
  closingBalance: number | null;
  transactions: Array<{ date: string; description: string; amount: number }>;
  balanceDifference: number | null;
};

type CommitResponse = { error?: string; statementId?: string; imported?: number; verificationStatus?: string; difference?: number };

function parseMoney(s: string) {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function StatementUploadClient() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pages, setPages] = useState<number | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [override, setOverride] = useState(false);
  const [commit, setCommit] = useState<CommitResponse | null>(null);

  const balanceDifference = useMemo(() => {
    if (!parsed) return null;
    if (parsed.openingBalance === null || parsed.closingBalance === null) return null;
    const sum = parsed.transactions.reduce((acc, t) => acc + t.amount, 0);
    const diff = parsed.closingBalance - (parsed.openingBalance + sum);
    return Math.round(diff * 100) / 100;
  }, [parsed]);

  const canImport = useMemo(() => {
    if (!parsed) return false;
    if (!parsed.institutionName || !parsed.accountName) return false;
    if (!parsed.statementStartDate || !parsed.statementEndDate) return false;
    if (parsed.openingBalance === null || parsed.closingBalance === null) return false;
    if (parsed.transactions.length === 0) return false;
    const diff = balanceDifference;
    if (diff === null) return false;
    if (Math.abs(diff) > 0.01 && !override) return false;
    return true;
  }, [parsed, override, balanceDifference]);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    setCommit(null);
    setParsed(null);
    setFileName(file.name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/statements/extract", { method: "POST", body: fd });
      const json: ExtractResponse = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to extract PDF");

      setPages(json.pages);

      const parseRes = await fetch("/api/statements/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uploadedFileName: json.uploadedFileName, text: json.text }),
      });
      const parsedJson = await parseRes.json();
      if (!parseRes.ok) throw new Error(parsedJson.error ?? "Failed to parse statement");
      setParsed(parsedJson.parsed);
    } finally {
      setBusy(false);
    }
  }

  async function importNow() {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    setCommit(null);
    try {
      const res = await fetch("/api/statements/commit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...parsed, uploadedFileName: fileName ?? "statement.pdf", override }),
      });
      const json: CommitResponse = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      setCommit(json);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="pdf">PDF file</Label>
        <Input
          id="pdf"
          type="file"
          accept="application/pdf,.pdf"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f).catch((err) => setError(String(err?.message ?? err)));
          }}
        />
        <div className="text-xs text-muted-foreground">
          {fileName ? (
            <>
              Loaded <span className="font-medium text-foreground">{fileName}</span>
              {pages ? ` • ${pages} pages` : ""}
            </>
          ) : (
            "Upload a text-based PDF statement."
          )}
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      {parsed && (
        <>
          <Separator />
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Institution</Label>
                <Input
                  value={parsed.institutionName ?? ""}
                  onChange={(e) => setParsed((p) => (p ? { ...p, institutionName: e.target.value } : p))}
                  placeholder="Institution name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Account name</Label>
                <Input
                  value={parsed.accountName ?? ""}
                  onChange={(e) => setParsed((p) => (p ? { ...p, accountName: e.target.value } : p))}
                  placeholder="Account name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Statement dates</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={parsed.statementStartDate ?? ""}
                    onChange={(e) => setParsed((p) => (p ? { ...p, statementStartDate: e.target.value } : p))}
                  />
                  <Input
                    type="date"
                    value={parsed.statementEndDate ?? ""}
                    onChange={(e) => setParsed((p) => (p ? { ...p, statementEndDate: e.target.value } : p))}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Opening balance</Label>
                <Input
                  value={parsed.openingBalance ?? ""}
                  onChange={(e) => {
                    const n = parseMoney(e.target.value);
                    setParsed((p) => (p ? { ...p, openingBalance: n } : p));
                  }}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Closing balance</Label>
                <Input
                  value={parsed.closingBalance ?? ""}
                  onChange={(e) => {
                    const n = parseMoney(e.target.value);
                    setParsed((p) => (p ? { ...p, closingBalance: n } : p));
                  }}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Verification</Label>
                <div className="flex items-center gap-2">
                  {balanceDifference === null ? (
                    <Badge variant="secondary">Missing data</Badge>
                  ) : Math.abs(balanceDifference) <= 0.01 ? (
                    <Badge variant="secondary">Balances</Badge>
                  ) : (
                    <Badge variant="destructive">Does not balance</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Diff: {balanceDifference === null ? "—" : balanceDifference.toFixed(2)}
                  </span>
                </div>
                {balanceDifference !== null && Math.abs(balanceDifference) > 0.01 && (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={override}
                      onChange={(e) => setOverride(e.target.checked)}
                    />
                    Override and import anyway
                  </label>
                )}
              </div>
            </div>

            <div className="rounded-md border">
              <div className="border-b p-3 text-sm font-medium">
                Extracted transactions <span className="text-muted-foreground">({parsed.transactions.length})</span>
              </div>
              <div className="max-h-[520px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[140px] text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.transactions.slice(0, 250).map((t, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Input
                            type="date"
                            value={t.date}
                            onChange={(e) =>
                              setParsed((p) =>
                                p
                                  ? {
                                      ...p,
                                      transactions: p.transactions.map((x, i) =>
                                        i === idx ? { ...x, date: e.target.value } : x,
                                      ),
                                    }
                                  : p,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={t.description}
                            onChange={(e) =>
                              setParsed((p) =>
                                p
                                  ? {
                                      ...p,
                                      transactions: p.transactions.map((x, i) =>
                                        i === idx ? { ...x, description: e.target.value } : x,
                                      ),
                                    }
                                  : p,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            value={String(t.amount)}
                            onChange={(e) => {
                              const n = Number(e.target.value);
                              setParsed((p) =>
                                p
                                  ? {
                                      ...p,
                                      transactions: p.transactions.map((x, i) =>
                                        i === idx ? { ...x, amount: Number.isFinite(n) ? n : x.amount } : x,
                                      ),
                                    }
                                  : p,
                              );
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsed.transactions.length > 250 && (
                <div className="border-t p-3 text-xs text-muted-foreground">
                  Showing first 250 extracted transactions.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button onClick={importNow} disabled={!canImport || busy}>
                Import statement
              </Button>
            </div>

            {commit && (
              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium">Statement imported</div>
                <div className="mt-1 text-muted-foreground">
                  Imported: {commit.imported ?? 0} • Verification: {commit.verificationStatus ?? "—"} • Diff:{" "}
                  {typeof commit.difference === "number" ? commit.difference.toFixed(2) : "—"}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

