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
  Sparkles,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { integrationService, GoogleSheetRow } from '../../services/integrationService';

export const IntegrationsPage: React.FC = () => {
  const [gsheetsConfig, setGsheetsConfig] = useState(() => integrationService.getGoogleSheetsConfig());
  const [sheetUrlInput, setSheetUrlInput] = useState(gsheetsConfig.sheetUrl);
  const [webhookUrlInput, setWebhookUrlInput] = useState(gsheetsConfig.webhookUrl);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [streamRows, setStreamRows] = useState<GoogleSheetRow[]>(() => integrationService.getGoogleSheetSyncStream());
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAppsScriptGuide, setShowAppsScriptGuide] = useState(false);

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

  const isConnectedValid = integrationService.isValidSheetUrl(gsheetsConfig.sheetUrl) || Boolean(gsheetsConfig.webhookUrl);

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSheet = sheetUrlInput.trim();
    const cleanWebhook = webhookUrlInput.trim();

    if (!cleanSheet && !cleanWebhook) {
      showToast('⚠️ Please enter a Google Sheet URL or Webhook URL.');
      return;
    }

    if (cleanSheet && !cleanSheet.includes('google.com/spreadsheets') && !cleanSheet.includes('macros.google.com')) {
      showToast('⚠️ Please enter a valid Google Sheet URL (docs.google.com/spreadsheets/...)');
      return;
    }

    integrationService.saveGoogleSheetsConfig({
      sheetUrl: cleanSheet,
      webhookUrl: cleanWebhook,
      isConnected: true,
      lastSyncedAt: 'Just now',
    });

    setGsheetsConfig(integrationService.getGoogleSheetsConfig());
    showToast('✅ Google Sheet connection saved & active!');
  };

  const handleDisconnect = () => {
    integrationService.saveGoogleSheetsConfig({
      sheetUrl: '',
      webhookUrl: '',
      isConnected: false,
      lastSyncedAt: undefined,
    });
    setSheetUrlInput('');
    setWebhookUrlInput('');
    setGsheetsConfig(integrationService.getGoogleSheetsConfig());
    showToast('Google Sheet disconnected.');
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
    showToast('Live test row synchronized to Google Sheets stream!');
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
    showToast('Copied! Direct paste (Ctrl+V) ready for Google Sheet (Cell A1).');
  };

  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.id || new Date().getTime(),
      data.date || new Date().toLocaleDateString(),
      data.studentName || 'Henza Noor',
      data.activityType || 'Daily Attendance',
      data.subject || 'All Subjects',
      data.score || 'Present',
      data.resultStatus || 'PRESENT',
      data.remarks || 'Recorded via StudyHub LMS',
      data.syncedAt || new Date().toLocaleString()
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    showToast('Apps Script code copied! Paste in Extensions > Apps Script.');
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
            Real-time synchronization for student daily attendance, test submissions, marks, and passing records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConnectedValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Google Sheet Connected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>No Sheet Connected Yet</span>
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3-STEP TARIQA: HOW TO CONNECT GOOGLE SHEET (EASY GUIDE)   */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-emerald-900 via-[#18362e] to-[#122822] text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4 border border-emerald-700/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-700/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-serif">
                Google Sheet Add Karne Ka Asaan Tareeqa (3 Steps)
              </h2>
              <p className="text-[11px] text-emerald-200/80">
                Bina kisi error ke 1 minute mein apni Google Sheet connect karein
              </p>
            </div>
          </div>

          <a
            href="https://sheets.new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>+ Create Blank Google Sheet (sheets.new)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-xs font-bold text-emerald-200">
                Nayi Sheet Banayein
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Upar button dabayein <strong className="text-white">"Create Blank Google Sheet"</strong>. Yeh aapke Google account mein aik bilkul nayi empty sheet khol dega.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-xs font-bold text-emerald-200">
                URL Copy &amp; Paste Karein
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Apni nayi Google Sheet ka browser address bar se link copy karein aur neechay diye gaye field mein paste karke <strong className="text-white">"Save &amp; Connect"</strong> dabayein.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="text-xs font-bold text-emerald-200">
                Data Transfer Karein
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Neechay <strong className="text-white">"Copy for Sheet (Ctrl+V)"</strong> dabayein aur apni Google Sheet ke pehle cell (<strong>Cell A1</strong>) par ja kar <strong>Ctrl + V</strong> (Paste) kar dein.
            </p>
          </div>
        </div>

        {/* Live Automatic Apps Script Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAppsScriptGuide(!showAppsScriptGuide)}
            className="w-full flex items-center justify-between text-xs text-emerald-300 hover:text-white transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Code2 className="w-3.5 h-3.5" />
              <span>Chahiye 100% Automatic Live Sync? (Google Apps Script Tareeqa dekhein)</span>
            </span>
            {showAppsScriptGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAppsScriptGuide && (
            <div className="mt-3 p-4 rounded-2xl bg-zinc-950/70 border border-emerald-500/20 text-xs space-y-3 animate-in fade-in duration-200">
              <p className="text-zinc-300 text-[11px]">
                Student ke daily presentation ya test submit karte hi Google Sheet khud ba khud live update ho jayegi bina kisi manual copy ke:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300">
                <li>Apni Google Sheet mein <strong>Extensions &gt; Apps Script</strong> par click karein.</li>
                <li>Wahan mojood purana code mita kar neechay diya gaya code paste karein:</li>
              </ol>

              <div className="relative">
                <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] text-emerald-400 font-mono overflow-x-auto">
                  {appsScriptCode}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Script</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-300">
                3. Click <strong>Deploy &gt; New Deployment &gt; Web app</strong>, Access: <strong>"Anyone"</strong> select karke Deploy dabayein aur Web app URL copy karke neechay Webhook URL box mein paste kar dein.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* CONNECTION FORM & ACTIVE STATUS                           */}
      {/* ========================================================= */}
      <div className="bg-white text-zinc-900 rounded-3xl border border-zinc-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 font-serif">
                  Google Sheet Setup
                </h3>
                {isConnectedValid ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active &bull; Synced
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                    Not Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                Daily presentation attendance aur 30-mark tests ka dynamic record is sheet ke saath sync hota hai.
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
              <span>{isSyncing ? 'Syncing...' : 'Sync Test Row'}</span>
            </button>

            {integrationService.isValidSheetUrl(gsheetsConfig.sheetUrl) ? (
              <a
                href={gsheetsConfig.sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span>Open Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span>+ Create Blank Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSaveConnection} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-800">
              1. Your Google Sheet URL (Spreadsheet Link)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={sheetUrlInput}
                onChange={(e) => setSheetUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/your-actual-sheet-id/edit"
                className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Paste the URL of your Google Sheet from the browser address bar.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-800 flex items-center justify-between">
              <span>2. Optional Webhook URL (For 100% Live Automatic Append)</span>
              <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
            </label>
            <div className="relative">
              <Code2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={webhookUrlInput}
                onChange={(e) => setWebhookUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Paste the Google Apps Script Web App URL if you deployed the automatic sync script.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Last sync: <strong className="text-zinc-800">{gsheetsConfig.lastSyncedAt || 'Ready'}</strong></span>
              </span>

              {isConnectedValid && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  title="Disconnect current Google Sheet"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save &amp; Connect Google Sheet</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================= */}
      {/* LIVE SYNCHRONIZED RECORDS STREAM                          */}
      {/* ========================================================= */}
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
              title="Copy all rows formatted for direct paste (Ctrl+V) into Google Sheet Cell A1"
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
