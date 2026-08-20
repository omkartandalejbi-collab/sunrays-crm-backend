import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { RefreshCw, CheckCircle2, AlertTriangle, FileSpreadsheet, UserCheck, Sparkles } from 'lucide-react';
import { leadService } from '../../../services/leadService';
import { SyncReport } from '../../../types';
import { toast } from 'sonner';

interface GoogleSheetSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSyncComplete: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  open,
  onOpenChange,
  onSyncComplete,
}) => {
  const [sheetUrl, setSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<SyncReport | null>(null);

  const handleSync = async () => {
    if (!sheetUrl.trim()) {
      toast.error('Please provide a Google Sheet URL or Spreadsheet ID');
      return;
    }

    setIsLoading(true);
    setReport(null);

    try {
      const syncResult = await leadService.syncGoogleSheet({ sheetUrl: sheetUrl.trim() });
      setReport(syncResult);
      toast.success('Google Sheet Synchronized Successfully!', {
        description: `Added ${syncResult.newLeadsAdded} new leads (${syncResult.duplicatesSkipped} duplicates skipped).`,
      });
      onSyncComplete();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to sync Google Sheet';
      toast.error('Sync Failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReport(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-6 bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Synchronize with Google Sheet</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Fetch lead rows from your Google Sheet, prevent duplicate entries, and auto-distribute new leads to active sales employees.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Google Sheet URL or Spreadsheet ID
            </Label>
            <Input
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit..."
              disabled={isLoading}
              className="h-10 text-xs font-mono bg-background border-border"
            />
            <p className="text-[11px] text-muted-foreground">
              Make sure the Google Sheet is shared with <strong>"Anyone with the link can view"</strong> or published to web.
            </p>
          </div>

          {/* Sync Report Results */}
          {report && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-success" />
                  Synchronization Report
                </span>
                <Badge variant="outline" className="text-[11px] font-semibold bg-background">
                  {report.totalRows} Total Rows Processed
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg border border-success/30 bg-success/10 p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-success-foreground block">
                    New Added
                  </span>
                  <span className="text-lg font-bold text-success">+{report.newLeadsAdded}</span>
                </div>

                <div className="rounded-lg border border-warning/30 bg-warning/10 p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-warning-foreground block">
                    Duplicates Skipped
                  </span>
                  <span className="text-lg font-bold text-warning">{report.duplicatesSkipped}</span>
                </div>

                <div className="rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-primary block">
                    Auto-Assigned
                  </span>
                  <span className="text-lg font-bold text-primary">{report.assignedCount}</span>
                </div>
              </div>

              {/* Employee Distribution Summary */}
              {Object.keys(report.employeeSummary).length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                    <UserCheck size={12} /> Balanced Allocation Breakdown:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(report.employeeSummary).map(([empName, count]) => (
                      <Badge
                        key={empName}
                        variant="secondary"
                        className="text-[11px] font-medium bg-background border border-border"
                      >
                        {empName}: <strong className="ml-1 text-primary">+{count}</strong>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {report.unassignedCount > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>
                    {report.unassignedCount} leads remained unassigned because no active sales employees were available.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
            {report ? 'Done' : 'Cancel'}
          </Button>

          <Button
            size="sm"
            onClick={handleSync}
            disabled={isLoading || !sheetUrl.trim()}
            className="gap-2 bg-primary text-white hover:bg-primary/90 font-semibold"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Syncing Sheet...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {report ? 'Sync Again' : 'Start Synchronization'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
