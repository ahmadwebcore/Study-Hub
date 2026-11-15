import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  GraduationCap,
  Printer,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import {
  URDU_GRAMMAR_ITEMS,
  ENGLISH_GRAMMAR_ITEMS,
  GrammarItem,
} from '../../data/grammarData';

export const GrammarHubPage: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'urdu' | 'english'>('urdu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const urduCategories = [
    { id: 'all', label: 'تمام قواعد (All Urdu)' },
    { id: 'urdu_letters', label: 'خطوط نویسی (Letters - 10 Marks)' },
    { id: 'urdu_dialogues', label: 'مکالمہ نگاری (Dialogues - 7 Marks)' },
    { id: 'urdu_applications', label: 'درخواستیں (Applications - 10 Marks)' },
    { id: 'urdu_rhetoric', label: 'علم بیان و اصطلاحات (تشبیہ و استعارہ)' },
  ];

  const englishCategories = [
    { id: 'all', label: 'All English' },
    { id: 'eng_tenses', label: '12 Tenses Formula Matrix' },
    { id: 'eng_voices', label: 'Active & Passive Voice' },
    { id: 'eng_narration', label: 'Direct & Indirect Speech' },
    { id: 'eng_pairs', label: '50 Pairs of Words' },
    { id: 'eng_idioms', label: '50 Board Idioms' },
  ];

  const currentCategories = activeLang === 'urdu' ? urduCategories : englishCategories;
  const rawItems = activeLang === 'urdu' ? URDU_GRAMMAR_ITEMS : ENGLISH_GRAMMAR_ITEMS;

  const filteredItems = rawItems.filter((item: GrammarItem) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.urduTitle && item.urduTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const handleCopyContent = (item: GrammarItem) => {
    const fullText = `${item.title}\n${item.urduTitle || ''}\n\n${item.content}\n\n${
      item.rules ? `Rules:\n${item.rules.join('\n')}` : ''
    }`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#142D27] via-[#1A3831] to-[#0D1F1A] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#14B866]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14B866]/20 border border-[#14B866]/30 text-[#14B866] text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>1st Year Intermediate Board Curriculum &bull; 2026 Edition</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Urdu & English Grammar Master Hub
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Complete Punjab & Federal Board examination preparation for 11th Class. Solved board letters, dialogues, formal applications, literary rhetoric (تشبیہ و استعارہ), 12 tenses formula matrix, active/passive voice, direct/indirect narration, 50 pairs of words, and idioms.
            </p>
          </div>

          {/* Language Switcher Tabs */}
          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveLang('urdu');
                setSelectedCategory('all');
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeLang === 'urdu'
                  ? 'bg-[#14B866] text-white shadow-md'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              اردو قواعد و انشا
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveLang('english');
                setSelectedCategory('all');
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeLang === 'english'
                  ? 'bg-[#14B866] text-white shadow-md'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              English Grammar
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category Filters, and Actions */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeLang === 'urdu'
                  ? 'قواعد، خط کا عنوان، یا اصطلاح تلاش کریں...'
                  : 'Search tenses, rules, pair of words, or idioms...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e1ede7] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#14B866] text-zinc-900 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white border border-[#e1ede7] rounded-xl text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span>Print Notes</span>
            </button>
            <span className="text-xs font-semibold text-zinc-500 bg-white border border-[#e1ede7] px-3 py-2 rounded-xl shadow-xs">
              {filteredItems.length} Topics Available
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {currentCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#142D27] text-white shadow-xs'
                  : 'bg-white text-zinc-600 hover:text-zinc-900 border border-[#e1ede7] hover:border-zinc-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grammar Cards Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredItems.map((item: GrammarItem) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#e1ede7] p-5 sm:p-6 hover:shadow-md transition-all space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">
                    {item.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {item.boardExamMarks && (
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.boardExamMarks} Board Marks
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
                  {item.title}
                </h3>
                {item.urduTitle && (
                  <p className="text-sm text-zinc-600 font-urdu font-medium">
                    {item.urduTitle}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyContent(item)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Topic</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div
              className={`p-4 sm:p-5 rounded-xl border border-zinc-100 ${
                activeLang === 'urdu' ? 'bg-[#FCFDFD] text-right dir-rtl font-urdu' : 'bg-[#FAFCFA] text-left'
              }`}
            >
              <pre
                className={`whitespace-pre-wrap leading-relaxed text-zinc-800 text-xs sm:text-sm ${
                  activeLang === 'urdu' ? 'font-urdu font-medium text-[15px]' : 'font-sans'
                }`}
              >
                {item.content}
              </pre>
            </div>

            {/* Board Rules & Examiner Criteria Box */}
            {item.rules && item.rules.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  بورڈ ممتحن کے خصوصی اصول و نمبروں کی تقسیم (Marking Criteria):
                </span>
                <div className="space-y-1 text-xs text-amber-950">
                  {item.rules.map((r, rIdx) => (
                    <p key={rIdx} className="font-urdu leading-relaxed">
                      &bull; {r}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Tags footer */}
            {item.tags && (
              <div className="flex items-center gap-1.5 pt-1">
                {item.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
