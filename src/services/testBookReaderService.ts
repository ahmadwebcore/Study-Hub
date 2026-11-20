import testBookPageMapData from '../data/testBookPageMap.json';

export interface BookSliceInfo {
  testId: string;
  subjectCode: string;
  bookKey: string;
  bookFile: string;
  bookTitleUrdu: string;
  bookTitleEnglish: string;
  coverUrl: string;
  startPage: number;
  endPage: number;
  totalPages: number;
  pageImages: string[];
  slicedPdfUrl: string;
  fullPdfUrl: string;
  secondaryBook?: {
    bookKey: string;
    bookTitleUrdu: string;
    bookTitleEnglish: string;
    coverUrl: string;
    startPage: number;
    endPage: number;
    totalPages: number;
    pageImages: string[];
    fullPdfUrl: string;
  };
}

export const BOOK_METADATA: Record<
  string,
  { urduTitle: string; engTitle: string; file: string; cover: string }
> = {
  tarjuma: {
    urduTitle: 'ترجمۃ القرآن المجید ۱۱ (پنجاب ٹیکسٹ بک بورڈ)',
    engTitle: 'Tarjuma-tul-Quran 11',
    file: 'tarjuma_tul_quran_11_punjab.pdf',
    cover: '/covers/cover_tarjuma_ptb.jpg',
  },
  islamiat: {
    urduTitle: 'اسلامیات لازمی ۱۱ (پنجاب ٹیکسٹ بک بورڈ)',
    engTitle: 'Islamic Studies (Islamiat) 11',
    file: 'islamiat_11_punjab.pdf',
    cover: '/covers/cover_islamiat_ptb.jpg',
  },
  economics: {
    urduTitle: 'اصولِ معاشیات ۱۱ (پنجاب ٹیکسٹ بک بورڈ)',
    engTitle: 'Principles of Economics 11',
    file: 'principles_of_economics_11_punjab.pdf',
    cover: '/covers/cover_economics.jpg',
  },
  physical_edu: {
    urduTitle: 'صحت و جسمانی تعلیم ۱۱ (پنجاب ٹیکسٹ بک بورڈ)',
    engTitle: 'Health & Physical Education 11',
    file: 'physical_education_11_punjab.pdf',
    cover: '/covers/cover_physical_edu.jpg',
  },
  urdu: {
    urduTitle: 'سرمایہ اُردو ۱۱ لازمی (پنجاب ٹیکسٹ بک بورڈ)',
    engTitle: 'Urdu Compulsory 11',
    file: 'urdu_11_punjab.pdf',
    cover: '/covers/cover_urdu_ptb.jpg',
  },
  english: {
    urduTitle: 'انگلش ۱۱ اور سن شائن گرامر (پنجاب ٹیکسٹ بک بورڈ)',
    engTitle: 'English 11 & Sunshine Grammar',
    file: 'english_11_punjab.pdf',
    cover: '/covers/cover_english_ptb.png',
  },
  computer: {
    urduTitle: 'کمپیوٹر سائنس ۱۱ (آئی ٹی سیریز — ٹیکسٹ بک بورڈ)',
    engTitle: 'Computer Science (IT Series) 11',
    file: 'computer_science_11_punjab.pdf',
    cover: '/covers/cover_computer_itseries.jpg',
  },
};

export function getBookSliceForTest(options: {
  testId?: string;
  testTitle?: string;
  subjectCode?: string;
  pagesRange?: string;
  syllabusCoverage?: string;
  bookTitle?: string;
  pdfFileName?: string;
  totalPages?: number;
}): BookSliceInfo {
  const {
    testId,
    testTitle = '',
    subjectCode = '',
    pagesRange = '',
    syllabusCoverage = '',
    bookTitle = '',
    pdfFileName = '',
    totalPages: inputTotalPages,
  } = options;

  // 1. Direct match by testId from precomputed map
  const mapped = testId ? (testBookPageMapData as Record<string, any>)[testId] : null;

  let bookKey = mapped?.bookKey || 'tarjuma';
  let startPage = mapped?.startPage || 1;
  let endPage = mapped?.endPage || 18;

  // Fallback if not directly matched by testId
  if (!mapped) {
    const code = subjectCode.toUpperCase();
    const title = `${testTitle} ${bookTitle}`.toLowerCase();
    const cov = syllabusCoverage.toLowerCase();
    const fName = pdfFileName.toLowerCase();

    if (code.includes('TQM') || title.includes('quran') || cov.includes('قرآن') || fName.includes('quran')) {
      bookKey = 'tarjuma';
    } else if (code.includes('ISL') || title.includes('islam') || cov.includes('اسلامیات') || fName.includes('islamiat')) {
      bookKey = 'islamiat';
    } else if (code.includes('ECO') || title.includes('economic') || cov.includes('معاشیات') || fName.includes('economic')) {
      bookKey = 'economics';
    } else if (code.includes('PED') || title.includes('physical') || cov.includes('جسمانی') || fName.includes('physical')) {
      bookKey = 'physical_edu';
    } else if (code.includes('CSC') || title.includes('computer') || cov.includes('computer') || fName.includes('computer')) {
      bookKey = 'computer';
    } else if (code.includes('ENG') || title.includes('english') || cov.includes('english') || fName.includes('english')) {
      bookKey = 'english';
    } else if (code.includes('URD') || title.includes('urdu') || cov.includes('اردو') || fName.includes('urdu')) {
      bookKey = 'urdu';
    }

    // Parse start and end page if available
    const combinedStr = `${pagesRange} ${syllabusCoverage} ${testTitle}`;
    const rangeMatch = combinedStr.match(/(?:pages|صفحات|صفحہ|pp\.?)\s*(\d+)\s*[-–toتا]\s*(\d+)/i);
    if (rangeMatch) {
      startPage = parseInt(rangeMatch[1], 10);
      endPage = parseInt(rangeMatch[2], 10);
    } else if (inputTotalPages && inputTotalPages > 0) {
      startPage = 1;
      endPage = inputTotalPages;
    } else {
      const singleMatch = combinedStr.match(/(?:pages|صفحات|صفحہ|pp\.?)\s*(\d+)/i);
      if (singleMatch) {
        startPage = parseInt(singleMatch[1], 10);
        endPage = startPage + 14;
      }
    }
  }

  const meta = BOOK_METADATA[bookKey] || BOOK_METADATA.tarjuma;
  const totalPages = Math.max(1, endPage - startPage + 1);

  // Generate image paths for each page in this slice
  const pageImages: string[] = [];
  for (let p = startPage; p <= endPage; p++) {
    pageImages.push(`/books/pages/${bookKey}/page_${p}.jpg`);
  }

  const result: BookSliceInfo = {
    testId: testId || 'test_slice',
    subjectCode: subjectCode || 'FA-IT 11',
    bookKey,
    bookFile: meta.file,
    bookTitleUrdu: meta.urduTitle,
    bookTitleEnglish: meta.engTitle,
    coverUrl: meta.cover,
    startPage,
    endPage,
    totalPages,
    pageImages,
    slicedPdfUrl: testId ? `/books/slices/${testId}.pdf` : `/books/${meta.file}`,
    fullPdfUrl: `/books/${meta.file}`,
  };

  // For Friday Combined Tests (ISL/TQM), provide secondary book toggle
  if (
    subjectCode.includes('TQM') ||
    subjectCode.includes('ISL') ||
    testTitle.includes('2 Books Combined') ||
    testTitle.includes('ترجمۃ القرآن')
  ) {
    const isPrimaryTarjuma = bookKey === 'tarjuma';
    const secKey = isPrimaryTarjuma ? 'islamiat' : 'tarjuma';
    const secMeta = BOOK_METADATA[secKey];
    const secStart = 1;
    const secEnd = Math.min(secStart + totalPages - 1, 35);
    const secTotal = secEnd - secStart + 1;
    const secImages: string[] = [];
    for (let p = secStart; p <= secEnd; p++) {
      secImages.push(`/books/pages/${secKey}/page_${p}.jpg`);
    }

    result.secondaryBook = {
      bookKey: secKey,
      bookTitleUrdu: secMeta.urduTitle,
      bookTitleEnglish: secMeta.engTitle,
      coverUrl: secMeta.cover,
      startPage: secStart,
      endPage: secEnd,
      totalPages: secTotal,
      pageImages: secImages,
      fullPdfUrl: `/books/${secMeta.file}`,
    };
  }

  return result;
}
