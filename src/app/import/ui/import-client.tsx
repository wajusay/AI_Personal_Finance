"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Mapping = {
  date: string;
  merchant: string;
  description: string;
  amount: string;
  accountName: string;
};

type PreviewRow = {
  rowIndex: number;
  date: string;
  merchant: string;
  description: string;
  accountName: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  needsReview: boolean;
  duplicate: boolean;
  confidenceScore?: number | null;
  aiSuggestedCategory?: string | null;
  aiReasoning?: string | null;
  aiError?: string | null;
};

type PreviewResponse = {
  error?: string;
  summary: {
    parsed: number;
    valid: number;
    invalid: number;
    duplicates: number;
    toImport: number;
    needsReview: number;
  };
  errors: Array<{ rowIndex: number; message: string }>;
  preview: PreviewRow[];
};

type CommitResponse = {
  error?: string;
  summary: {
    parsed: number;
    valid: number;
    invalid: number;
    created: number;
    skippedDuplicates: number;
  };
  errors: Array<{ rowIndex: number; message: string }>;
};

export default function ImportClient({ ruleCount }: { ruleCount: number }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string | null | undefined>[]>([]);
  const [mapping, setMapping] = useState<Mapping>({
    date: "",
    merchant: "",
    description: "",
    amount: "",
    accountName: "",
  });
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [errors, setErrors] = useState<Array<{ rowIndex: number; message: string }> | null>(null);
  const [summary, setSummary] = useState<PreviewResponse["summary"] | null>(null);
  const [busy, setBusy] = useState(false);
  const [committed, setCommitted] = useState<CommitResponse | null>(null);

  const canPreview = useMemo(() => {
    return (
      headers.length > 0 &&
      rows.length > 0 &&
      mapping.date &&
      mapping.merchant &&
      mapping.description &&
      mapping.amount &&
      mapping.accountName
    );
  }, [headers.length, rows.length, mapping]);

  function onFileChange(file: File | null) {
    setCommitted(null);
    setPreview(null);
    setErrors(null);
    setSummary(null);
    setMapping({ date: "", merchant: "", description: "", amount: "", accountName: "" });

    if (!file) {
      setFileName(null);
      setHeaders([]);
      setRows([]);
      return;
    }

    setFileName(file.name);
    Papa.parse<Record<string, string | null | undefined>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const hs = (result.meta.fields ?? []).filter(Boolean);
        setHeaders(hs);
        setRows(result.data ?? []);
      },
    });
  }

  async function runPreview() {
    if (!canPreview) return;
    setBusy(true);
    setCommitted(null);
    try {
      const res = await fetch("/api/import/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ headers, rows, mapping, limit: 5000 }),
      });
      const json: PreviewResponse = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Preview failed");
      setPreview(json.preview);
      setErrors(json.errors);
      setSummary(json.summary);
    } finally {
      setBusy(false);
    }
  }

  async function commit() {
    if (!canPreview) return;
    setBusy(true);
    try {
      const res = await fetch("/api/import/commit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ headers, rows, mapping, limit: 5000 }),
      });
      const json: CommitResponse = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Import failed");
      setCommitted(json);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="file">CSV file</Label>
        <Input
          id="file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <div className="text-xs text-muted-foreground">
          {fileName ? (
            <>
              Loaded <span className="font-medium text-foreground">{fileName}</span> •{" "}
              {rows.length.toLocaleString()} rows • {headers.length} columns • Rules:{" "}
              {ruleCount.toLocaleString()}
            </>
          ) : (
            "Upload a CSV export from your bank or credit card."
          )}
        </div>
      </div>

      {headers.length > 0 && (
        <>
          <Separator />
          <div className="grid gap-3">
            <div className="text-sm font-medium">Map columns</div>
            <div className="grid gap-3 md:grid-cols-2">
              {(
                [
                  ["date", "Date"],
                  ["merchant", "Merchant"],
                  ["description", "Description"],
                  ["amount", "Amount"],
                  ["accountName", "Account name"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="grid gap-2">
                  <Label htmlFor={key}>{label}</Label>
                  <select
                    id={key}
                    value={mapping[key]}
                    onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select column…</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={runPreview} disabled={!canPreview || busy}>
                Preview import
              </Button>
              {preview && (
                <Button onClick={commit} variant="secondary" disabled={busy}>
                  Save import
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {summary && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">Valid: {summary.valid}</Badge>
            <Badge variant="secondary">Invalid: {summary.invalid}</Badge>
            <Badge variant="secondary">Duplicates: {summary.duplicates}</Badge>
            <Badge variant="secondary">To import: {summary.toImport}</Badge>
            <Badge variant="secondary">Needs review: {summary.needsReview}</Badge>
          </div>
        </>
      )}

      {errors && errors.length > 0 && (
        <div className="rounded-md border p-3 text-sm">
          <div className="font-medium">Parse issues</div>
          <div className="mt-2 grid gap-1 text-muted-foreground">
            {errors.slice(0, 10).map((e, idx) => (
              <div key={idx}>
                Row {e.rowIndex + 2}: {e.message}
              </div>
            ))}
            {errors.length > 10 && <div>…and {errors.length - 10} more</div>}
          </div>
        </div>
      )}

      {preview && (
        <div className="rounded-md border">
          <div className="border-b p-3 text-sm font-medium">Preview (first {preview.length})</div>
          <div className="max-h-[520px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Date</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden lg:table-cell">Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Signals</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.slice(0, 200).map((t) => (
                  <TableRow key={t.rowIndex}>
                    <TableCell className="text-sm">{t.date.slice(0, 10)}</TableCell>
                    <TableCell className="font-medium">{t.merchant}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {t.description}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {t.accountName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.needsReview ? "secondary" : "secondary"}>{t.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {t.duplicate && <Badge variant="destructive">Duplicate</Badge>}
                        {!t.duplicate && t.needsReview && <Badge variant="secondary">Needs Review</Badge>}
                        {!t.duplicate && !t.needsReview && <Badge variant="secondary">Auto</Badge>}
                        {typeof t.confidenceScore === "number" && (
                          <Badge variant="secondary">
                            {Math.round(t.confidenceScore * 100)}%
                          </Badge>
                        )}
                        {t.aiSuggestedCategory && (
                          <Badge variant="secondary">AI: {t.aiSuggestedCategory}</Badge>
                        )}
                        {t.aiError && <Badge variant="destructive">AI error</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {t.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {preview.length > 200 && (
            <div className="border-t p-3 text-xs text-muted-foreground">
              Showing first 200 preview rows.
            </div>
          )}
        </div>
      )}

      {committed && (
        <div className="rounded-md border p-3 text-sm">
          <div className="font-medium">Import complete</div>
          <div className="mt-2 text-muted-foreground">
            Created: {committed.summary.created} • Skipped duplicates: {committed.summary.skippedDuplicates} • Invalid:{" "}
            {committed.summary.invalid}
          </div>
        </div>
      )}
    </div>
  );
}

