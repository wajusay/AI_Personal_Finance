## AI Personal Finance (V1)

Local-first, privacy-first personal finance ledger.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite

### Dev setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000`.

### What’s included (V1)

- Dashboard: totals (income/expenses/net), recent transactions, spending by category
- Transactions: searchable + filters (category/date/type), edit/delete
- Add transaction form

### Notes

- No authentication yet
- No AI yet
- SQLite DB is local (`prisma/dev.db`) and ignored by git

### V2 (in progress)

- CSV import with column mapping + preview + duplicate detection
- Deterministic categorization rules (priority-based)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
