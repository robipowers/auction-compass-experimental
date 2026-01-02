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
import { Save, Loader2 } from "lucide-react";
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
            <span className="section-icon">📊</span>
            <div>
              <div className="text-xl">Yesterday's Context</div>
              <div className="text-sm font-normal text-muted-foreground">
                Prior Session Structure
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dayType">Day Type</Label>
            <Select
              value={yesterday.dayType}
              onValueChange={(v) =>
                setYesterday((prev) => ({ ...prev, dayType: v as DayType }))
              }
            >
              <SelectTrigger id="dayType">
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
            <Label htmlFor="valueRelationship">Value Relationship</Label>
            <Select
              value={yesterday.valueRelationship}
              onValueChange={(v) =>
                setYesterday((prev) => ({
                  ...prev,
                  valueRelationship: v as ValueRelationship,
                }))
              }
            >
              <SelectTrigger id="valueRelationship">
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
            <Label htmlFor="structure">Structure</Label>
            <Select
              value={yesterday.structure}
              onValueChange={(v) =>
                setYesterday((prev) => ({ ...prev, structure: v as Structure }))
              }
            >
              <SelectTrigger id="structure">
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
            <Label htmlFor="prominentVpoc">Prominent VPOC</Label>
            <Input
              id="prominentVpoc"
              placeholder="e.g., 1.17285"
              value={yesterday.prominentVpoc}
              onChange={(e) =>
                setYesterday((prev) => ({ ...prev, prominentVpoc: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Context */}
      <Card variant="feature" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="section-icon">📈</span>
            <div>
              <div className="text-xl">Today's Context</div>
              <div className="text-sm font-normal text-muted-foreground">
                Current Market State
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="inventory">Inventory</Label>
            <Select
              value={today.inventory}
              onValueChange={(v) =>
                setToday((prev) => ({ ...prev, inventory: v as Inventory }))
              }
            >
              <SelectTrigger id="inventory">
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
            <Label htmlFor="openRelation">Open Relation</Label>
            <Select
              value={today.openRelation}
              onValueChange={(v) =>
                setToday((prev) => ({ ...prev, openRelation: v as OpenRelation }))
              }
            >
              <SelectTrigger id="openRelation">
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
            <span className="section-icon">🎯</span>
            <div>
              <div className="text-xl">Reference Levels</div>
              <div className="text-sm font-normal text-muted-foreground">
                Key Structural Pivots
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="overnightHigh">Overnight High</Label>
            <Input
              id="overnightHigh"
              placeholder="e.g., 1.18024"
              value={levels.overnightHigh}
              onChange={(e) =>
                setLevels((prev) => ({ ...prev, overnightHigh: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overnightLow">Overnight Low</Label>
            <Input
              id="overnightLow"
              placeholder="e.g., 1.17761"
              value={levels.overnightLow}
              onChange={(e) =>
                setLevels((prev) => ({ ...prev, overnightLow: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yesterdayVah">Yesterday VAH</Label>
            <Input
              id="yesterdayVah"
              placeholder="e.g., 1.17528"
              value={levels.yesterdayVah}
              onChange={(e) =>
                setLevels((prev) => ({ ...prev, yesterdayVah: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yesterdayVal">Yesterday VAL</Label>
            <Input
              id="yesterdayVal"
              placeholder="e.g., 1.17053"
              value={levels.yesterdayVal}
              onChange={(e) =>
                setLevels((prev) => ({ ...prev, yesterdayVal: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="hero"
          size="lg"
          onClick={handleSave}
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Plan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Auction Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
