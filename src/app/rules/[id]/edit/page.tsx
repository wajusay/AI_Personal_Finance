import { notFound } from "next/navigation";

import { updateRule } from "@/app/rules/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function EditRulePage({
  params,
}: {
  params: { id: string };
}) {
  const rule = await prisma.categoryRule.findUnique({ where: { id: params.id } });
  if (!rule) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit rule</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateRule.bind(null, rule.id)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="matchText">Match text</Label>
              <Input id="matchText" name="matchText" defaultValue={rule.matchText} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={rule.category} required />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="transactionType">Transaction type</Label>
                <select
                  id="transactionType"
                  name="transactionType"
                  defaultValue={rule.transactionType ?? "ALL"}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ALL">All</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Input id="priority" name="priority" type="number" defaultValue={String(rule.priority)} required />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link href="/rules" className={buttonVariants({ variant: "secondary" })}>
                Cancel
              </Link>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

