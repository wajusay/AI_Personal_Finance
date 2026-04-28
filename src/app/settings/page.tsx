import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { updateSettings } from "@/app/settings/actions";

export default async function SettingsPage() {
  const s = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Local-only AI categorization uses Ollama running on your machine (127.0.0.1).
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Local AI categorization (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="grid gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="aiEnabled" defaultChecked={s.aiEnabled} />
              Enable local AI categorization (Ollama)
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="ollamaModel">Ollama model</Label>
                <Input
                  id="ollamaModel"
                  name="ollamaModel"
                  defaultValue={s.ollamaModel}
                  placeholder="llama3.2 or mistral"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: <span className="font-medium text-foreground">llama3.2</span> or{" "}
                  <span className="font-medium text-foreground">mistral</span>
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="aiConfidenceThreshold">Confidence threshold</Label>
                <Input
                  id="aiConfidenceThreshold"
                  name="aiConfidenceThreshold"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  defaultValue={String(s.aiConfidenceThreshold)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Below this threshold, items go to <span className="font-medium text-foreground">Action Required</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

