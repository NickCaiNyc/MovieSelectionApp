"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { trpc } from "../lib/trpc/client";

const zones = [
  { value: "front", label: "Front" },
  { value: "mid", label: "Middle" },
  { value: "back", label: "Back" },
];

interface PreferenceModalProps {
  userId: string;
}

export function PreferenceModal({ userId }: PreferenceModalProps) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const prefsQuery = trpc.prefs.get.useQuery({ userId }, { enabled: open });
  const saveMutation = trpc.prefs.save.useMutation({
    onSuccess: async () => {
      await utils.prefs.get.invalidate({ userId });
      setOpen(false);
    },
  });

  const basePrefs = useMemo(
    () => ({
      zone: "mid",
      timeStart: 18,
      timeEnd: 22,
      radiusKm: 25,
      partySize: 2,
    }),
    []
  );

  const prefs = prefsQuery.data ?? basePrefs;
  const [zone, setZone] = useState(prefs.zone);

  useEffect(() => {
    if (open) {
      setZone(prefs.zone ?? basePrefs.zone);
    }
  }, [open, prefs.zone, basePrefs.zone]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Seating Preferences</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Customize your preferences</DialogTitle>
        <DialogDescription>
          Save your favorite seating zone, showtime window, travel radius, and party size. These preferences are persisted in
          Supabase.
        </DialogDescription>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            saveMutation.mutate({
              userId,
              zone,
              timeStart: Number(form.get("timeStart") ?? prefs.timeStart),
              timeEnd: Number(form.get("timeEnd") ?? prefs.timeEnd),
              radiusKm: Number(form.get("radiusKm") ?? prefs.radiusKm),
              partySize: Number(form.get("partySize") ?? prefs.partySize),
            });
          }}
        >
          <input type="hidden" name="zone" value={zone} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Preferred zone</span>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zoneOption) => (
                    <SelectItem key={zoneOption.value} value={zoneOption.value}>
                      {zoneOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Time window start (24h)</span>
              <input
                name="timeStart"
                type="number"
                min={0}
                max={23}
                defaultValue={prefs.timeStart}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Time window end (24h)</span>
              <input
                name="timeEnd"
                type="number"
                min={0}
                max={23}
                defaultValue={prefs.timeEnd}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Radius (km)</span>
              <input
                name="radiusKm"
                type="number"
                min={1}
                max={200}
                defaultValue={prefs.radiusKm}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Party size</span>
              <input
                name="partySize"
                type="number"
                min={1}
                max={10}
                defaultValue={prefs.partySize}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save preferences"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
