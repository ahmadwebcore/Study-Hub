// Pakistan Official Public & Gazetted Academic Holidays (2026 Edition)
// StudyHub Academic Calendar integrates official gazetted holidays across Pakistan.
// On these dates and every Sunday, academic tasks, homework, and tests are strictly OFF.

export interface PakistanHoliday {
  id: string;
  name: string;
  urduName: string;
  date: string; // YYYY-MM-DD
  monthDay: string; // MM-DD
  dayOfWeek: string;
  type: 'national' | 'gazetted' | 'religious' | 'observance';
  description: string;
  isOffDay: boolean;
}

export const PAKISTAN_HOLIDAYS_2026: PakistanHoliday[] = [
  {
    id: 'pk_kashmir_day',
    name: 'Kashmir Solidarity Day',
    urduName: 'Youm-e-Kashmir',
    date: '2026-02-05',
    monthDay: '02-05',
    dayOfWeek: 'Thursday',
    type: 'national',
    description: 'National public holiday observed across Pakistan in solidarity with the Kashmiri people.',
    isOffDay: true,
  },
  {
    id: 'pk_pakistan_day',
    name: 'Pakistan Day (Resolution Day)',
    urduName: 'Youm-e-Pakistan',
    date: '2026-03-23',
    monthDay: '03-23',
    dayOfWeek: 'Monday',
    type: 'national',
    description: 'Commemorates the passage of the historic Lahore Resolution on 23rd March 1940.',
    isOffDay: true,
  },
  {
    id: 'pk_eid_fitr_1',
    name: 'Eid-ul-Fitr (Day 1)',
    urduName: 'Eid-ul-Fitr (Day 1)',
    date: '2026-03-21',
    monthDay: '03-21',
    dayOfWeek: 'Saturday',
    type: 'religious',
    description: 'Gazetted public holiday marking the joyous conclusion of the holy month of Ramadan.',
    isOffDay: true,
  },
  {
    id: 'pk_eid_fitr_2',
    name: 'Eid-ul-Fitr (Day 2)',
    urduName: 'Eid-ul-Fitr (Day 2)',
    date: '2026-03-22',
    monthDay: '03-22',
    dayOfWeek: 'Sunday',
    type: 'religious',
    description: 'Second day of national Eid-ul-Fitr celebrations and family gatherings.',
    isOffDay: true,
  },
  {
    id: 'pk_eid_fitr_3',
    name: 'Eid-ul-Fitr (Day 3)',
    urduName: 'Eid-ul-Fitr (Day 3)',
    date: '2026-03-23',
    monthDay: '03-23',
    dayOfWeek: 'Monday',
    type: 'religious',
    description: 'Third day of Eid-ul-Fitr official public holidays across all educational institutions.',
    isOffDay: true,
  },
  {
    id: 'pk_labour_day',
    name: 'Labour Day (May Day)',
    urduName: 'Youm-e-Mazdoor',
    date: '2026-05-01',
    monthDay: '05-01',
    dayOfWeek: 'Friday',
    type: 'national',
    description: 'International Workers Day recognized as a national gazetted holiday throughout Pakistan.',
    isOffDay: true,
  },
  {
    id: 'pk_eid_adha_1',
    name: 'Eid-ul-Adha (Day 1)',
    urduName: 'Eid-ul-Adha (Day 1)',
    date: '2026-05-27',
    monthDay: '05-27',
    dayOfWeek: 'Wednesday',
    type: 'religious',
    description: 'Feast of the Sacrifice, celebrated on the 10th of Zil-Hajj across Pakistan.',
    isOffDay: true,
  },
  {
    id: 'pk_eid_adha_2',
    name: 'Eid-ul-Adha (Day 2)',
    urduName: 'Eid-ul-Adha (Day 2)',
    date: '2026-05-28',
    monthDay: '05-28',
    dayOfWeek: 'Thursday',
    type: 'religious',
    description: 'Second day of Eid-ul-Adha official public holiday.',
    isOffDay: true,
  },
  {
    id: 'pk_eid_adha_3',
    name: 'Eid-ul-Adha (Day 3)',
    urduName: 'Eid-ul-Adha (Day 3)',
    date: '2026-05-29',
    monthDay: '05-29',
    dayOfWeek: 'Friday',
    type: 'religious',
    description: 'Third day of Eid-ul-Adha official public holiday.',
    isOffDay: true,
  },
  {
    id: 'pk_ashura_1',
    name: 'Ashura (9th Muharram)',
    urduName: 'Ashura (9th Muharram)',
    date: '2026-06-25',
    monthDay: '06-25',
    dayOfWeek: 'Thursday',
    type: 'religious',
    description: 'Gazetted public holiday observed on the 9th of Muharram.',
    isOffDay: true,
  },
  {
    id: 'pk_ashura_2',
    name: 'Ashura (10th Muharram)',
    urduName: 'Ashura (10th Muharram)',
    date: '2026-06-26',
    monthDay: '06-26',
    dayOfWeek: 'Friday',
    type: 'religious',
    description: 'National gazetted holiday on the 10th of Muharram observed nationwide.',
    isOffDay: true,
  },
  {
    id: 'pk_independence_day',
    name: 'Independence Day (Youm-e-Azadi)',
    urduName: 'Youm-e-Azadi (14th August)',
    date: '2026-08-14',
    monthDay: '08-14',
    dayOfWeek: 'Friday',
    type: 'national',
    description: 'Pakistan Independence Day commemorating national sovereignty achieved on 14th August 1947.',
    isOffDay: true,
  },
  {
    id: 'pk_milad_un_nabi',
    name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)',
    urduName: 'Eid Milad-un-Nabi',
    date: '2026-08-25',
    monthDay: '08-25',
    dayOfWeek: 'Tuesday',
    type: 'religious',
    description: 'Birth of Prophet Muhammad (PBUH) observed as a national gazetted holiday.',
    isOffDay: true,
  },
  {
    id: 'pk_iqbal_day',
    name: 'Iqbal Day',
    urduName: 'Youm-e-Iqbal',
    date: '2026-11-09',
    monthDay: '11-09',
    dayOfWeek: 'Monday',
    type: 'national',
    description: 'Commemorates the birth anniversary of national poet and philosopher Dr. Allama Muhammad Iqbal.',
    isOffDay: true,
  },
  {
    id: 'pk_quaid_day',
    name: 'Quaid-e-Azam Day & Christmas',
    urduName: 'Quaid-e-Azam Day & Christmas',
    date: '2026-12-25',
    monthDay: '12-25',
    dayOfWeek: 'Friday',
    type: 'national',
    description: 'Birth anniversary of Quaid-e-Azam Muhammad Ali Jinnah and Christmas festivities.',
    isOffDay: true,
  },
];

/**
 * Checks if a given date string (YYYY-MM-DD or partial MM-DD) matches an official Pakistan Gazetted Holiday.
 */
export function getPakistanHoliday(dateStr: string): PakistanHoliday | undefined {
  if (!dateStr) return undefined;
  
  // Format to YYYY-MM-DD if possible
  const cleanDate = dateStr.slice(0, 10);
  const matched = PAKISTAN_HOLIDAYS_2026.find((h) => h.date === cleanDate);
  if (matched) return matched;

  // Fallback match on MM-DD
  const monthDay = cleanDate.length >= 10 ? cleanDate.slice(5, 10) : dateStr;
  return PAKISTAN_HOLIDAYS_2026.find((h) => h.monthDay === monthDay);
}

/**
 * Checks if a date is strictly an OFF day:
 * Returns true if the day is a Sunday (weekly rest) OR matches a Pakistan Gazetted Holiday.
 */
export function isAcademicOffDay(dateObjOrStr: Date | string): {
  isOff: boolean;
  reason: string;
  urduReason?: string;
  holiday?: PakistanHoliday;
} {
  const d = typeof dateObjOrStr === 'string' ? new Date(dateObjOrStr) : dateObjOrStr;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // Check Sunday first
  if (d.getDay() === 0) {
    return {
      isOff: true,
      reason: 'Sunday Off — Mandatory Weekly Rest & Light Revision',
      urduReason: 'Sunday Rest & Light Revision',
    };
  }

  // Check Pakistan Gazetted Holiday
  const holiday = getPakistanHoliday(dateStr);
  if (holiday && holiday.isOffDay) {
    return {
      isOff: true,
      reason: `🇵🇰 ${holiday.name} — Gazetted Public Holiday`,
      urduReason: holiday.urduName,
      holiday,
    };
  }

  return {
    isOff: false,
    reason: 'Standard Academic Day',
  };
}

/**
 * Returns upcoming Pakistan Gazetted Holidays starting from today.
 */
export function getUpcomingPakistanHolidays(limit: number = 4): PakistanHoliday[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  const future = PAKISTAN_HOLIDAYS_2026.filter((h) => h.date >= todayStr);
  if (future.length >= limit) return future.slice(0, limit);
  // If near end of year, wrap around or return all
  return PAKISTAN_HOLIDAYS_2026.slice(0, limit);
}
