import Link from "next/link";
import { EntityType } from "@prisma/client";

import { createEntity, deleteEntity } from "@/app/entities/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";

export default async function EntitiesPage() {
  const entities = await prisma.entity.findMany({
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entities</h1>
          <p className="text-sm text-muted-foreground">
            Track transactions across personal and business entities. Review with tax advisor.
          </p>
        </div>
        <Link href="/tax-review" className={buttonVariants({ variant: "secondary" })}>
          Tax review
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Add entity</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEntity} className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="e.g. Personal, ACME LLC" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={EntityType.PERSONAL}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {Object.values(EntityType).map((t) => (
                  <option key={t} value={t}>
                    {t.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="Optional" />
            </div>
            <div className="flex items-end gap-2 md:col-span-4">
              <Button type="submit">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Entities <span className="text-muted-foreground">({entities.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Notes</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No entities yet.
                  </TableCell>
                </TableRow>
              ) : (
                entities.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{e.type.toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {e.notes ?? ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/entities/${e.id}/edit`}
                          className={buttonVariants({ size: "sm", variant: "secondary" })}
                        >
                          Edit
                        </Link>
                        <form action={deleteEntity.bind(null, e.id)}>
                          <Button size="sm" variant="destructive" type="submit">
                            Delete
                          </Button>
                        </form>
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

