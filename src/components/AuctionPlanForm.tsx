import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2, Calendar, TrendingUp, Target } from "lucide-react";
import {
  YesterdayContext,
  TodayContext,
  ReferenceLevels,
  DAY_TYPE_LABELS,
  VALUE_RELATIONSHIP_LABELS,
  STRUCTURE_LABELS,
  INVENTORY_LABELS,
  OPEN_RELATION_LABELS,
  DayType,
  ValueRelationship,
  Structure,
  Inventory,
  OpenRelation,
} from "@/types/auction";

interface AuctionPlanFormProps {
  onSave: (data: {
    yesterday: YesterdayContext;
    today: TodayContext;
    levels: ReferenceLevels;
  }) => Promise<void>;
  isLoading: boolean;
}

export function AuctionPlanForm({ onSave, isLoading }: AuctionPlanFormProps) {
  const [yesterday, setYesterday] = useState<YesterdayContext>({
    dayType: "normal",
    valueRelationship: "inside_previous",
    structure: "balanced",
    prominentVpoc: "",
  });

  const [today, setToday] = useState<TodayContext>({
    inventory: "neutral",
    openRelation: "oiv",
  });

  const [levels, setLevels] = useState<ReferenceLevels>({
    overnightHigh: "",
    overnightLow: "",
    yesterdayVah: "",
    yesterdayVal: "",
  });

  const handleSave = async () => {
    await onSave({ yesterday, today, levels });
  };

  return (
    <div className="space-y-6">
      {/* Yesterday's Context */}
      <Card variant="feature" className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-info shadow-lg shadow-primary/20">
              <Calendar className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="text-lg font-semibold">Yesterday's Context</div>
              <div className="text-sm font-normal text-muted-foreground">
                Prior Session Structure
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dayType" className="text-sm font-medium">Day Type</Label>
            <Select
              value={yesterday.dayType}
              onValueChange={(v) =>
                setYesterday((prev) => ({ ...prev, dayType: v as DayType }))
              }
            >
              <SelectTrigger id="dayType" className="h-11">
                <SelectValue placeholder="Select day type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DAY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valueRelationship" className="text-sm font-medium">Value Relationship</Label>
            <Select
              value={yesterday.valueRelationship}
              onValueChange={(v) =>
                setYesterday((prev) => ({
                  ...prev,
                  valueRelationship: v as ValueRelationship,
                }))
              }
            >
              <SelectTrigger id="valueRelationship" className="h-11">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VALUE_RELATIONSHIP_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="structure" className="text-sm font-medium">Structure</Label>
            <Select
              value={yesterday.structure}
              onValueChange={(v) =>
                setYesterday((prev) => ({ ...prev, structure: v as Structure }))
              }
            >
              <SelectTrigger id="structure" className="h-11">
                <SelectValue placeholder="Select structure" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STRUCTURE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prominentVpoc" className="text-sm font-medium">Prominent VPOC</Label>
            <Input
              id="prominentVpoc"
              placeholder="e.g., 1.17285"
              value={yesterday.prominentVpoc}
              onChange={(e) =>
                setYesterday((prev) => ({ ...prev, prominentVpoc: e.target.value }))
              }
              className="h-11 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Context */}
      <Card variant="feature" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="text-lg font-semibold">Today's Context</div>
              <div className="text-sm font-normal text-muted-foreground">
                Current Market State
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="inventory" className="text-sm font-medium">Inventory</Label>
            <Select
              value={today.inventory}
              onValueChange={(v) =>
                setToday((prev) => ({ ...prev, inventory: v as Inventory }))
              }
            >
              <SelectTrigger id="inventory" className="h-11">
                <SelectValue placeholder="Select inventory" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INVENTORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openRelation" className="text-sm font-medium">Open Relation</Label>
            <Select
              value={today.openRelation}
              onValueChange={(v) =>
                setToday((prev) => ({ ...prev, openRelation: v as OpenRelation }))
              }
            >
              <SelectTrigger id="openRelation" className="h-11">
                <SelectValue placeholder="Select open relation" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OPEN_RELATION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reference Levels */}
      <Card variant="feature" className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-warning to-warning/70 shadow-lg shadow-warning/20">
              <Target className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="text-lg font-semibold">Reference Levels</div>
              <div className="text-sm font-normal text-muted-foreground">
                Key Structural Pivots
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="overnightHigh" className="text-sm font-medium">Overnight High</Label>
            <Input
              id="overnightHigh"
              placeholder="e.g., 1.18024"
              value={levels.overnightHigh}
              onChange={(e) =>
                setLevels((prev) => ({ ...prev, overnightHigh: e.target.value }))
              }
              className="h-11 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overnightLow" className="text-sm font-medium">Overnight Low</Label>
            <Input
              id="overnightLow"
              placeholder="e.g., 1.17761"
              value={levels.overnightLow}
              onChange={(e) =>
                setLevels((prev) => ({ ...prev, overnightLow: e.target.value }))
              }
              className="h-11 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yesterdayVah" className="text-sm font-medium">Yesterday VAH</Label>
            <Input
              id="yesterdayVah"
              placeholder="e.g., 1.17528"
              value={levels.yesterdayVah}
              onChange={(e) =>
                setLevels((prev) => ({ ...prev, yesterdayVah: e.target.value }))
              }
              className="h-11 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yesterdayVal" className="text-sm font-medium">Yesterday VAL</Label>
            <Input
              id="yesterdayVal"
              placeholder="e.g., 1.17053"
              value={levels.yesterdayVal}
              onChange={(e) =>
                setLevels((prev) => ({ ...prev, yesterdayVal: e.target.value }))
              }
              className="h-11 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="hero"
          size="xl"
          onClick={handleSave}
          disabled={isLoading}
          className="min-w-[220px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving Plan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Auction Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}