import { useState } from 'react';
import { Plus, Pencil, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useAlerts, 
  useDeleteAlert, 
  useToggleAlertStatus,
  useBulkAlertAction,
  useActiveAlertCount 
} from '@/hooks/use-alerts';
import { AlertFormModal } from '@/components/alerts/AlertFormModal';
import { Alert, AlertPriority, INSTRUMENTS } from '@/types/alerts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [instrumentFilter, setInstrumentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const { data: alerts = [], isLoading } = useAlerts({ 
    status: statusFilter,
    instrument: instrumentFilter,
    priority: priorityFilter,
  });
  const { data: activeCount = 0 } = useActiveAlertCount();
  const deleteAlert = useDeleteAlert();
  const toggleStatus = useToggleAlertStatus();
  const bulkAction = useBulkAlertAction();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(alerts.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      await deleteAlert.mutateAsync(id);
      toast.success('Alert deleted');
    }
  };

  const handleToggle = async (id: string, currentlyActive: boolean) => {
    await toggleStatus.mutateAsync({ id, isActive: !currentlyActive });
    toast.success(currentlyActive ? 'Alert disabled' : 'Alert enabled');
  };

  const handleBulkAction = async (action: 'enable' | 'disable' | 'delete') => {
    if (selectedIds.size === 0) return;
    
    if (action === 'delete' && !confirm(`Delete ${selectedIds.size} alerts?`)) {
      return;
    }
    
    await bulkAction.mutateAsync({ ids: Array.from(selectedIds), action });
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} alerts ${action === 'delete' ? 'deleted' : action}d`);
  };

  const priorityColors: Record<AlertPriority, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    important: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    informational: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Alerts</h1>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            {activeCount} active
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/alerts/history">
            <Button variant="outline">View History</Button>
          </Link>
          <Button onClick={() => { setEditingAlert(null); setIsModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-card rounded-lg border border-border">
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alerts</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={instrumentFilter} onValueChange={setInstrumentFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Instrument" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Instruments</SelectItem>
            {INSTRUMENTS.map(i => (
              <SelectItem key={i.value} value={i.value}>{i.value}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="informational">Informational</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('enable')}>
              Enable
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('disable')}>
              Disable
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="w-12 p-4">
                <Checkbox 
                  checked={alerts.length > 0 && selectedIds.size === alerts.length}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Alert Name</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Instrument</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Condition</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Loading alerts...
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No alerts found. Create your first alert to get started.
                </td>
              </tr>
            ) : (
              alerts.map(alert => (
                <tr key={alert.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <Checkbox 
                      checked={selectedIds.has(alert.id)}
                      onCheckedChange={(checked) => handleSelectOne(alert.id, !!checked)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{alert.name}</span>
                      {alert.is_scenario_alert && (
                        <Badge variant="outline" className="text-xs bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                          SCENARIO
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm">{alert.instrument}</td>
                  <td className="p-4 text-sm">
                    {alert.condition_direction === 'above' ? 'Breaks above' : 
                     alert.condition_direction === 'below' ? 'Breaks below' : 'Crosses'} {alert.condition_value.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <Badge className={cn("capitalize", priorityColors[alert.priority])}>
                      {alert.priority}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={alert.is_active 
                      ? "bg-green-500/20 text-green-400 border-green-500/30" 
                      : "bg-secondary text-muted-foreground"
                    }>
                      {alert.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(alert)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleToggle(alert.id, alert.is_active)}
                      >
                        {alert.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Alert Form Modal */}
      <AlertFormModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAlert(null); }}
        editingAlert={editingAlert}
      />
    </div>
  );
}
