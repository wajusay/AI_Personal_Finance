export type ExtractedStatement = {
  institutionName: string | null;
  accountName: string | null;
  statementStartDate: string | null; // YYYY-MM-DD
  statementEndDate: string | null; // YYYY-MM-DD
  openingBalance: number | null;
  closingBalance: number | null;
  transactions: Array<{
    date: string; // YYYY-MM-DD
    description: string;
    amount: number; // signed
  }>;
};

function toIsoDateUTC(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateToken(token: string) {
  const t = token.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const m1 = iso.exec(t);
  if (m1) return toIsoDateUTC(new Date(Date.UTC(Number(m1[1]), Number(m1[2]) - 1, Number(m1[3]))));

  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const m2 = us.exec(t);
  if (m2) return toIsoDateUTC(new Date(Date.UTC(Number(m2[3]), Number(m2[1]) - 1, Number(m2[2]))));

  return null;
}

function parseMoney(token: string) {
  const raw = token.trim();
  if (!raw) return null;
  const neg = raw.includes("(") && raw.includes(")");
  const cleaned = raw.replace(/[,$()]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return neg ? -Math.abs(n) : n;
}

function findFirstMatch(lines: string[], re: RegExp) {
  for (const l of lines) {
    const m = re.exec(l);
    if (m) return m;
  }
  return null;
}

function extractDateRangeFromMatch(m: RegExpExecArray | null) {
  if (!m) return { start: null as string | null, end: null as string | null };
  const dates = m
    .slice(1)
    .map((g) => (typeof g === "string" ? parseDateToken(g) : null))
    .filter((d): d is string => !!d);
  return { start: dates[0] ?? null, end: dates[1] ?? null };
}

export function parseStatementText(text: string): ExtractedStatement {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Institution name: first non-empty line (best-effort).
  const institutionName = lines[0] ?? null;

  // Date range: try common patterns.
  const range =
    findFirstMatch(lines, /(statement period|period|from)\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*(to|\-|through)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i) ??
    findFirstMatch(lines, /(\d{1,2}\/\d{1,2}\/\d{4})\s*(to|\-|through)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);

  const { start: statementStartDate, end: statementEndDate } = extractDateRangeFromMatch(range);

  // Account name: try to find "Account" line.
  const acct =
    findFirstMatch(lines, /(account name|account)\s*:?\s*(.+)$/i) ??
    findFirstMatch(lines, /(checking|savings|credit card)\s+account\s*:?\s*(.+)$/i);
  const accountName = acct ? String(acct[2] ?? acct[1]).trim() : null;

  // Balances: try common phrases.
  const opening =
    findFirstMatch(lines, /(opening balance|beginning balance|starting balance)\s*:?\s*\$?([(\-]?[0-9,]+\.[0-9]{2}[)]?)/i) ??
    findFirstMatch(lines, /(beginning balance)\s+\$?([(\-]?[0-9,]+\.[0-9]{2}[)]?)/i);
  const closing =
    findFirstMatch(lines, /(closing balance|ending balance|new balance)\s*:?\s*\$?([(\-]?[0-9,]+\.[0-9]{2}[)]?)/i) ??
    findFirstMatch(lines, /(ending balance)\s+\$?([(\-]?[0-9,]+\.[0-9]{2}[)]?)/i);

  const openingBalance = opening ? parseMoney(opening[2]) : null;
  const closingBalance = closing ? parseMoney(closing[2]) : null;

  // Transaction extraction (simple heuristic):
  // Lines starting with a date token and ending with an amount-like token.
  const txs: ExtractedStatement["transactions"] = [];
  const dateAtStart = /^(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\s+/;
  const moneyAtEnd = /([(\-]?\$?[0-9,]+\.[0-9]{2}[)]?)\s*$/;

  for (const l of lines) {
    const dm = dateAtStart.exec(l);
    if (!dm) continue;
    const date = parseDateToken(dm[1]);
    if (!date) continue;

    const mm = moneyAtEnd.exec(l);
    if (!mm) continue;
    const amount = parseMoney(mm[1].replace("$", ""));
    if (amount === null) continue;

    const desc = l
      .replace(dateAtStart, "")
      .replace(moneyAtEnd, "")
      .trim();
    if (!desc) continue;

    txs.push({ date, description: desc, amount });
  }

  return {
    institutionName,
    accountName,
    statementStartDate,
    statementEndDate,
    openingBalance,
    closingBalance,
    transactions: txs,
  };
}

export function computeBalanceDifference(input: {
  openingBalance: number | null;
  closingBalance: number | null;
  transactions: Array<{ amount: number }>;
}) {
  if (input.openingBalance === null || input.closingBalance === null) return null;
  const sum = input.transactions.reduce((acc, t) => acc + t.amount, 0);
  const expectedClosing = input.openingBalance + sum;
  const diff = input.closingBalance - expectedClosing;
  // Round to cents.
  return Math.round(diff * 100) / 100;
}

