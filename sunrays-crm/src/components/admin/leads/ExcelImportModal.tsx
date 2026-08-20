import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Upload, FileSpreadsheet, CheckCircle2, RefreshCw, Sparkles, X, UserCheck } from 'lucide-react';
import { leadService } from '../../../services/leadService';
import { SyncReport } from '../../../types';
import { toast } from 'sonner';

interface ExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  open,
  onOpenChange,
  onImportComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<SyncReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      toast.error('Invalid file format', {
        description: 'Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.',
      });
      return;
    }

    setSelectedFile(file);
    setReport(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select an Excel or CSV file to import');
      return;
    }

    setIsLoading(true);
    setReport(null);

    try {
      const syncResult = await leadService.syncExcel(selectedFile);
      setReport(syncResult);
      toast.success('Excel File Imported Successfully!', {
        description: `Imported ${syncResult.newLeadsAdded} new leads (${syncResult.duplicatesSkipped} duplicates skipped).`,
      });
      onImportComplete();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to import Excel file';
      toast.error('Import Failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setReport(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-6 bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <Upload size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Import Leads from Excel / CSV</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Upload a spreadsheet with lead contacts. The system will detect new leads, ignore duplicates, and auto-assign them.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* File Upload Dropzone */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30 bg-background'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2.5">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <FileSpreadsheet size={28} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Click to upload or drag & drop spreadsheet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) files
                  </p>
                </div>
                <Badge variant="outline" className="text-[11px] text-muted-foreground mt-1">
                  Max file size: 10MB
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground truncate max-w-[280px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setSelectedFile(null);
                  setReport(null);
                }}
                disabled={isLoading}
              >
                <X size={16} />
              </Button>
            </div>
          )}

          {/* Sync Report Results */}
          {report && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-success" />
                  Import Summary
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
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
            {report ? 'Done' : 'Cancel'}
          </Button>

          <Button
            size="sm"
            onClick={handleImport}
            disabled={isLoading || !selectedFile}
            className="gap-2 bg-primary text-white hover:bg-primary/90 font-semibold"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Processing Excel File...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {report ? 'Import Another' : 'Process and Import'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
