import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  CheckCircle2,
  Save,
  ShieldCheck,
  RefreshCw,
  Link2,
} from 'lucide-react';
import { integrationService, GoogleSheetRow } from '../../services/integrationService';

export const IntegrationsPage: React.FC = () => {
  const [gsheetsConfig, setGsheetsConfig] = useState(() => integrationService.getGoogleSheetsConfig());
  const [sheetUrlInput, setSheetUrlInput] = useState(gsheetsConfig.sheetUrl);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [streamRows, setStreamRows] = useState<GoogleSheetRow[]>(() => integrationService.getGoogleSheetSyncStream());
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 3500);
  };

  const reloadStream = () => {
    setStreamRows(integrationService.getGoogleSheetSyncStream());
    setGsheetsConfig(integrationService.getGoogleSheetsConfig());
  };

  useEffect(() => {
    const handleUpdate = () => reloadStream();
    window.addEventListener('studyhub_gsheet_updated', handleUpdate);
    window.addEventListener('studyhub_gsheet_config_updated', handleUpdate);
    return () => {
      window.removeEventListener('studyhub_gsheet_updated', handleUpdate);
      window.removeEventListener('studyhub_gsheet_config_updated', handleUpdate);
    };
  }, []);

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    integrationService.saveGoogleSheetsConfig({
      sheetUrl: sheetUrlInput.trim(),
      webhookUrl: sheetUrlInput.trim().includes('macros.google.com') ? sheetUrlInput.trim() : gsheetsConfig.webhookUrl,
      isConnected: true,
      lastSyncedAt: 'Just now',
    });
    setGsheetsConfig(integrationService.getGoogleSheetsConfig());
    showToast('Google Sheet connection saved & active!');
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 600));

    integrationService.recordActivityInGoogleSheet({
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      studentName: 'Henza Noor',
      activityType: 'Daily Attendance (Present)',
      subject: 'Physical Education 11',
      score: 'Present (On-Time)',
      resultStatus: 'PRESENT',
      remarks: 'Manual sync ping verified by Faculty Director Ahmad',
    });

    setIsSyncing(false);
    reloadStream();
    showToast('Live ping row synchronized to Google Sheets stream!');
  };

  const handleDownloadCSV = () => {
    integrationService.downloadCSV();
    showToast('Google Sheets CSV downloaded successfully.');
  };

  const handleCopyTableData = () => {
    const csv = integrationService.generateCSVForGoogleSheets(streamRows);
    const tsv = csv
      .split('\n')
      .map((row) =>
        row
          .split(',')
          .map((cell) => cell.replace(/^"|"$/g, ''))
          .join('\t')
      )
      .join('\n');

    navigator.clipboard.writeText(tsv);
    showToast('Copied! Direct paste (Ctrl+V) ready for any Google Sheet.');
  };

  return (
    <div className="space-y-6 w-full font-sans pb-16">
      {/* Toast Alert */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-white border border-[#e1ede7] text-[#142D27] flex items-center gap-2.5 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 ring-1 ring-black/5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
              Cloud Integration
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              1st Year FA-IT &bull; BISE DG Khan
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mt-1 font-serif">
            Google Sheets Live Sync
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time synchronization for student daily attendance, test submissions, marks, and passing benchmark records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Automatic Sync Active</span>
          </span>
        </div>
      </div>

      {/* Simple Connection Card */}
      <div className="bg-white text-zinc-900 rounded-3xl border border-zinc-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 font-serif">
                  Connected Google Sheet
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Whenever student marks daily attendance or completes a test, records are instantly logged here.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            {gsheetsConfig.sheetUrl && (
              <a
                href={gsheetsConfig.sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span>Open Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Ultra-Simple Setup Form */}
        <form onSubmit={handleSaveConnection} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Google Sheet URL or Webhook Link
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={sheetUrlInput}
                onChange={(e) => setSheetUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id"
                className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Last synchronized: <strong className="text-zinc-800">{gsheetsConfig.lastSyncedAt || 'Just now'}</strong></span>
            </span>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save &amp; Connect Google Sheet</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Synced Rows Bento Card */}
      <div className="bg-white text-zinc-900 rounded-3xl border border-zinc-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-bold text-zinc-900 font-serif">
              Live Synchronized Records Stream ({streamRows.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Real-time feed of all student attendance presentations and 30-mark test evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTableData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
              <span>Copy for Sheet (Ctrl+V)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sheet CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Score / Status</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {streamRows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3 px-4 text-zinc-900 font-semibold whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 px-4 text-zinc-800 whitespace-nowrap">
                    {row.studentName}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-800">
                      {row.activityType === 'Daily Attendance (Present)' ? '✋ Attendance' : '📝 Test Marks'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-700 whitespace-nowrap">
                    {row.subject}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                    {row.score}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.resultStatus === 'PASSED' || row.resultStatus === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {row.resultStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{row.syncedAt}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
