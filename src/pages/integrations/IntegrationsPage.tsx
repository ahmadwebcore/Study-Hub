import React, { useState } from 'react';
import {
  FileSpreadsheet,
  MessageCircle,
  Download,
  Copy,
  ExternalLink,
  CheckCircle2,
  Send,
  Save,
  ShieldCheck,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { integrationService } from '../../services/integrationService';
import { SAMPLE_RESULTS, SAMPLE_STUDENT } from '../../data/sampleData';
import { BISE_DG_KHAN_INFO } from '../../services/biseDGKhanService';

export const IntegrationsPage: React.FC = () => {
  const [waConfig, setWaConfig] = useState(() => integrationService.getWhatsAppConfig());
  const [gsheetsConfig, setGsheetsConfig] = useState(() => integrationService.getGoogleSheetsConfig());
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [customPhone, setCustomPhone] = useState(waConfig.phoneNumber);

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 3500);
  };

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    integrationService.saveWhatsAppConfig({
      ...waConfig,
      phoneNumber: customPhone,
    });
    showToast('WhatsApp recipient number saved successfully.');
  };

  const handleSaveGSheets = (e: React.FormEvent) => {
    e.preventDefault();
    integrationService.saveGoogleSheetsConfig(gsheetsConfig);
    showToast('Google Sheets sync settings saved.');
  };

  const handleDownloadCSV = () => {
    const csv = integrationService.generateCSVForGoogleSheets(
      SAMPLE_RESULTS.map((r) => ({
        id: r.id,
        testTitle: r.testTitle,
        subjectName: r.subjectName,
        date: r.date,
        studentName: r.studentName,
        score: r.score,
        maxScore: r.maxScore,
        percentage: r.percentage || Math.round((r.score / r.maxScore) * 100),
        grade: r.grade,
        status: r.passed ? 'PASSED' : 'RETEST',
        feedback: r.feedback,
      }))
    );
    integrationService.downloadCSV(csv, `StudyHub_FAIT_Marks_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Google Sheets CSV file downloaded.');
  };

  const handleCopyTableData = () => {
    const csv = integrationService.generateCSVForGoogleSheets(
      SAMPLE_RESULTS.map((r) => ({
        id: r.id,
        testTitle: r.testTitle,
        subjectName: r.subjectName,
        date: r.date,
        studentName: r.studentName,
        score: r.score,
        maxScore: r.maxScore,
        percentage: r.percentage || Math.round((r.score / r.maxScore) * 100),
        grade: r.grade,
        status: r.passed ? 'PASSED' : 'RETEST',
        feedback: r.feedback,
      }))
    );
    const tsv = csv.split('\n').map((row) => row.split(',').map((cell) => cell.replace(/^"|"$/g, '')).join('\t')).join('\n');
    navigator.clipboard.writeText(tsv);
    showToast('Copied! Direct paste (Ctrl+V) ready for Google Sheets.');
  };

  // Sample WhatsApp message for preview
  const sampleResultMsg = integrationService.formatTestResultForWhatsApp({
    studentName: SAMPLE_STUDENT.name,
    subjectName: 'Computer Science (FA-IT 11th)',
    testTitle: 'Chapter 2: Network Topologies (30 Marks)',
    score: 28,
    maxScore: 30,
    percentage: 93,
    grade: 'A*',
    passed: true,
    date: 'Today',
    feedback: 'Outstanding preparation and clean diagrams. All short questions answered with board precision.',
  });

  const sampleQuotaMsg = integrationService.formatDailyQuotaForWhatsApp({
    studentName: SAMPLE_STUDENT.name,
    day: 'Thursday',
    subject: 'Computer Science',
    quotaPages: 'Pages 96 to 98',
    testTitle: 'Chapter 2 Network Topologies Assessment (30 Marks)',
  });

  const handleOpenWhatsAppTest = () => {
    const url = integrationService.generateWhatsAppUrl(sampleResultMsg, customPhone);
    window.open(url, '_blank');
  };

  const handleOpenWhatsAppQuota = () => {
    const url = integrationService.generateWhatsAppUrl(sampleQuotaMsg, customPhone);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-16">
      {/* Toast Alert */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white flex items-center gap-2.5 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
              External Connectors
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              1st Year FA-IT &bull; BISE DG Khan
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mt-1 font-serif">
            Platform Integrations
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Directly connect your academic portal with WhatsApp and Google Sheets (Zero API required).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-semibold border border-zinc-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero External API Costs
          </span>
        </div>
      </div>

      {/* Integration 1: WhatsApp Direct Connector - Test Series Mini-Card Aesthetic */}
      <div className="bg-white text-zinc-900 rounded-3xl border border-zinc-200 p-5 sm:p-6 shadow-sm hover:border-zinc-300 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 font-serif">
                  WhatsApp Direct Connector
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  Free &bull; Ready
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Share 30-mark test results, daily reading quotas, and Ahmad's remarks to student or parents with 1 click.
              </p>
            </div>
          </div>

          <div className="text-xs text-zinc-500 flex items-center gap-1.5 shrink-0 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Direct wa.me Instant Protocol
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSaveWhatsApp} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Recipient WhatsApp Number
            </label>
            <input
              type="text"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder="e.g. 923001234567"
              className="w-full h-9 px-3 text-xs bg-white rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
            />
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Country code without +, e.g. 92300...</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Recipient Label
            </label>
            <input
              type="text"
              value={waConfig.recipientName}
              onChange={(e) => setWaConfig({ ...waConfig, recipientName: e.target.value })}
              placeholder="e.g. Henza Noor / Parent"
              className="w-full h-9 px-3 text-xs bg-white rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Recipient
            </button>
          </div>
        </form>

        {/* Action Triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Action 1: Test Result Report
              </span>
              <h3 className="text-xs font-bold text-zinc-900 mt-1">
                Send 30-Mark Test Result &amp; Teacher Remarks
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Sends concise report with student score, percentage, passed/fail status, and Ahmad's review note.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenWhatsAppTest}
              className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in WhatsApp (Result Card)</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Action 2: Daily Quota &amp; Schedule
              </span>
              <h3 className="text-xs font-bold text-zinc-900 mt-1">
                Send Today's Book Quota &amp; Timetable
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Sends today's ~2.5 pages reading quota, test time, and 3-month target reminder.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenWhatsAppQuota}
              className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-colors border border-zinc-200 cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in WhatsApp (Daily Quota)</span>
            </button>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="mt-2 bg-zinc-50 text-zinc-800 p-3.5 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Live Message Preview (Short &amp; Direct):</span>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-700">{sampleResultMsg}</pre>
        </div>
      </div>

      {/* Integration 2: Google Sheets Synchronizer - Test Series Mini-Card Aesthetic */}
      <div className="bg-white text-zinc-900 rounded-3xl border border-zinc-200 p-5 sm:p-6 shadow-sm hover:border-zinc-300 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 font-serif">
                  Google Sheets Synchronizer &amp; Exporter
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Export and synchronize all 30-mark tests, student marks, and syllabus progress directly to Google Sheets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Download CSV Sheet</span>
            </button>
            <button
              type="button"
              onClick={handleCopyTableData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Data for GSheets</span>
            </button>
          </div>
        </div>

        {/* Google Sheets Link & Webhook Configuration */}
        <form onSubmit={handleSaveGSheets} className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Linked Google Sheet URL
              </label>
              <input
                type="url"
                value={gsheetsConfig.sheetUrl || ''}
                onChange={(e) => setGsheetsConfig({ ...gsheetsConfig, sheetUrl: e.target.value })}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full h-9 px-3 text-xs bg-white rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Apps Script Webhook / Sync URL (Optional)
              </label>
              <input
                type="text"
                value={gsheetsConfig.webhookUrl || ''}
                onChange={(e) => setGsheetsConfig({ ...gsheetsConfig, webhookUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full h-9 px-3 text-xs bg-white rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              Last Synced: <strong className="text-zinc-800">{gsheetsConfig.lastSyncedAt || 'Just now'}</strong>
            </span>
            <div className="flex items-center gap-2">
              {gsheetsConfig.sheetUrl && (
                <a
                  href={gsheetsConfig.sheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-800 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 shadow-2xs"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 rounded-xl transition-colors border border-zinc-200 shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Sheet Records Preview Table */}
        <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white shadow-2xs">
          <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs font-bold text-zinc-800">
            <span>Recent Test Marks Export Table ({SAMPLE_RESULTS.length} Rows)</span>
            <span className="text-[11px] font-normal text-zinc-500">Ready for Google Sheets paste</span>
          </div>
          <div className="max-h-56 overflow-y-auto divide-y divide-zinc-100 text-xs">
            {SAMPLE_RESULTS.map((row) => (
              <div key={row.id} className="p-2.5 flex items-center justify-between hover:bg-zinc-50">
                <div className="min-w-0 pr-2">
                  <span className="font-bold text-zinc-900 block truncate">{row.testTitle}</span>
                  <span className="text-[11px] text-zinc-500">{row.subjectName} &bull; {row.date}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-700 block">{row.score}/{row.maxScore} Marks</span>
                  <span className="text-[10px] text-zinc-400">Grade {row.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration 3: BISE DG Khan Official Desk Status */}
      <div className="bg-white text-zinc-900 rounded-3xl border border-zinc-200 p-5 shadow-sm hover:border-zinc-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center text-lg font-bold shrink-0">
            🇵🇰
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 font-serif">
              {BISE_DG_KHAN_INFO.shortName} Official Board Portal Link
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Annual Examination May 2027 &bull; Syllabus Target: Feb 28, 2027 &bull; 6 Subjects FA-IT
            </p>
          </div>
        </div>

        <a
          href={BISE_DG_KHAN_INFO.officialWebsite}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Board Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
