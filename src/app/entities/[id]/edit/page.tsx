import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityType } from "@prisma/client";

import { updateEntity } from "@/app/entities/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/db";

export default async function EditEntityPage({ params }: { params: { id: string } }) {
  const entity = await prisma.entity.findUnique({ where: { id: params.id } });
  if (!entity) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit entity</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateEntity.bind(null, entity.id)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={entity.name} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={entity.type}
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
              <Input id="notes" name="notes" defaultValue={entity.notes ?? ""} />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Link href="/entities" className={buttonVariants({ variant: "secondary" })}>
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

