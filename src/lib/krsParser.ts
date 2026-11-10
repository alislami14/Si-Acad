import * as XLSX from 'xlsx';

export interface ParsedKrsItem {
  courseName: string;
  courseCode?: string;
  lecturer?: string;
  credits?: number;
  dayOfWeek: number; // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  dayName: string;
  startTime: string; // '08:00'
  endTime: string;   // '10:30'
  room?: string;
}

const DAY_MAP: Record<string, number> = {
  senin: 1,
  monday: 1,
  selasa: 2,
  tuesday: 2,
  rabu: 3,
  wednesday: 3,
  kamis: 4,
  thursday: 4,
  jumat: 5,
  friday: 5,
  sabtu: 6,
  saturday: 6,
  minggu: 0,
  ahad: 0,
  sunday: 0,
};

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function parseDayName(rawDay: string | number): { dayOfWeek: number; dayName: string } {
  if (typeof rawDay === 'number') {
    const valid = rawDay >= 0 && rawDay <= 6 ? rawDay : 1;
    return { dayOfWeek: valid, dayName: DAY_NAMES[valid] };
  }
  const clean = String(rawDay || '').toLowerCase().trim();
  const matched = DAY_MAP[clean];
  if (matched !== undefined) {
    return { dayOfWeek: matched, dayName: DAY_NAMES[matched] };
  }
  return { dayOfWeek: 1, dayName: 'Senin' };
}

export function normalizeTime(rawTime: string, defaultTime = '08:00'): string {
  if (!rawTime) return defaultTime;
  const str = String(rawTime).trim().replace('.', ':');
  const match = str.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    const hour = match[1].padStart(2, '0');
    const min = match[2];
    return `${hour}:${min}`;
  }
  return defaultTime;
}

/**
 * Parsing teks hasil dari Gemini AI (bisa berupa JSON murni atau teks dengan blok kode ```json ... ```)
 */
export function parseGeminiText(text: string): ParsedKrsItem[] {
  if (!text || !text.trim()) return [];

  // 1. Ekstrak blok JSON jika dibungkus markdown ```json ... ```
  let cleanText = text.trim();
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleanText.match(jsonBlockRegex);
  if (match && match[1]) {
    cleanText = match[1].trim();
  }

  // 2. Coba parse JSON
  try {
    const parsed = JSON.parse(cleanText);
    const array = Array.isArray(parsed) ? parsed : parsed.courses || parsed.jadwal || parsed.data || [];
    if (Array.isArray(array) && array.length > 0) {
      return array
        .map((item: any) => {
          const name = item.name || item.courseName || item.mata_kuliah || item.matakuliah || item.mk || '';
          if (!name) return null;

          const rawDay = item.day || item.hari || item.dayOfWeek || item.hari_kuliah || 'Senin';
          const { dayOfWeek, dayName } = parseDayName(rawDay);

          let startTime = '08:00';
          let endTime = '09:40';

          if (item.time || item.jam || item.waktu) {
            const timeRange = String(item.time || item.jam || item.waktu).split(/[-–—sampais/d]/i);
            if (timeRange.length >= 2) {
              startTime = normalizeTime(timeRange[0], '08:00');
              endTime = normalizeTime(timeRange[1], '09:40');
            }
          } else {
            startTime = normalizeTime(item.startTime || item.jam_mulai || item.start || '08:00');
            endTime = normalizeTime(item.endTime || item.jam_selesai || item.end || '09:40');
          }

          return {
            courseName: String(name).trim(),
            courseCode: item.code || item.kode || item.kode_mk || '',
            lecturer: item.lecturer || item.dosen || item.pengampu || '',
            credits: parseInt(item.credits || item.sks || 3, 10) || 3,
            dayOfWeek,
            dayName,
            startTime,
            endTime,
            room: item.room || item.ruang || item.ruangan || 'Kampus',
          } as ParsedKrsItem;
        })
        .filter((item): item is ParsedKrsItem => item !== null);
    }
  } catch {
    // Jika bukan JSON, coba baris per baris teks CSV / tab-separated
  }

  // 3. Fallback CSV / Baris teks
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);
  const results: ParsedKrsItem[] = [];

  for (const line of lines) {
    // Pisahkan dengan tab atau koma atau pipe |
    const parts = line.split(/[,\t|]/).map((p) => p.trim());
    if (parts.length >= 3) {
      // Format perkiraan: [Nama MK, Hari, Jam Mulai, Jam Selesai, Ruang, Dosen]
      const name = parts[0];
      if (name.toLowerCase().includes('mata kuliah') || name.toLowerCase().includes('nama mk')) {
        continue; // skip header
      }
      const { dayOfWeek, dayName } = parseDayName(parts[1]);
      const startTime = normalizeTime(parts[2] || '08:00');
      const endTime = normalizeTime(parts[3] || '09:40');
      const room = parts[4] || 'Kampus';
      const lecturer = parts[5] || '';

      results.push({
        courseName: name,
        dayOfWeek,
        dayName,
        startTime,
        endTime,
        room,
        lecturer,
        credits: 3,
      });
    }
  }

  return results;
}

/**
 * Parsing file Excel (.xlsx / .xls) atau .csv
 */
export async function parseExcelFile(file: File): Promise<ParsedKrsItem[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Konversi sheet ke array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  if (!rawRows || rawRows.length === 0) return [];

  const results: ParsedKrsItem[] = [];

  for (const row of rawRows) {
    // Cari key fleksibel
    let courseName = '';
    let courseCode = '';
    let lecturer = '';
    let credits = 3;
    let rawDay = 'Senin';
    let rawStartTime = '08:00';
    let rawEndTime = '09:40';
    let room = 'Kampus';

    for (const [key, val] of Object.entries(row)) {
      const k = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const strVal = String(val).trim();

      if (k.includes('matakuliah') || k.includes('namamk') || k.includes('course') || k === 'nama') {
        courseName = strVal;
      } else if (k.includes('kode') || k === 'code') {
        courseCode = strVal;
      } else if (k.includes('dosen') || k.includes('lecturer') || k.includes('pengampu')) {
        lecturer = strVal;
      } else if (k.includes('sks') || k.includes('credit')) {
        credits = parseInt(strVal, 10) || 3;
      } else if (k.includes('hari') || k.includes('day')) {
        rawDay = strVal;
      } else if (k.includes('jammulai') || k.includes('mulai') || k.includes('start')) {
        rawStartTime = strVal;
      } else if (k.includes('jamselesai') || k.includes('selesai') || k.includes('end')) {
        rawEndTime = strVal;
      } else if (k.includes('jam') || k.includes('waktu') || k.includes('time')) {
        const parts = strVal.split(/[-–—]/);
        if (parts.length >= 2) {
          rawStartTime = parts[0];
          rawEndTime = parts[1];
        } else {
          rawStartTime = strVal;
        }
      } else if (k.includes('ruang') || k.includes('room') || k.includes('kelas')) {
        room = strVal;
      }
    }

    if (courseName) {
      const { dayOfWeek, dayName } = parseDayName(rawDay);
      results.push({
        courseName,
        courseCode,
        lecturer,
        credits: credits || 3,
        dayOfWeek,
        dayName,
        startTime: normalizeTime(rawStartTime, '08:00'),
        endTime: normalizeTime(rawEndTime, '09:40'),
        room: room || 'Kampus',
      });
    }
  }

  return results;
}

/**
 * Buat dan unduh file template Excel sederhana untuk mahasiswa
 */
export function downloadExcelTemplate(): void {
  const templateData = [
    {
      'Nama Mata Kuliah': 'Pemrograman Web Lanjut',
      'Kode MK': 'TIF-301',
      'SKS': 3,
      'Hari': 'Senin',
      'Jam Mulai': '08:00',
      'Jam Selesai': '10:30',
      'Ruangan': 'Lab Software 2',
      'Dosen Pengampu': 'Budi Raharjo, M.Kom.',
    },
    {
      'Nama Mata Kuliah': 'Manajemen Basis Data',
      'Kode MK': 'TIF-302',
      'SKS': 3,
      'Hari': 'Selasa',
      'Jam Mulai': '10:00',
      'Jam Selesai': '12:30',
      'Ruangan': 'Ruang 401 Gedung Fasilkom',
      'Dosen Pengampu': 'Ir. Siti Nurhaliza, M.T.',
    },
    {
      'Nama Mata Kuliah': 'Analisis & Perancangan Sistem',
      'Kode MK': 'TIF-303',
      'SKS': 3,
      'Hari': 'Rabu',
      'Jam Mulai': '13:00',
      'Jam Selesai': '15:30',
      'Ruangan': 'Ruang 305 Gedung Fasilkom',
      'Dosen Pengampu': 'Dr. Hendra Wijaya, M.Kom.',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal Kuliah');
  XLSX.writeFile(workbook, 'Template_Jadwal_Kuliah_SI_Acad.xlsx');
}

/**
 * Prompt siap pakai untuk diberikan ke Gemini AI / ChatGPT
 */
export const GEMINI_KRS_PROMPT = `Halo Gemini! Tolong bantu saya mengekstrak jadwal kuliah dari foto/screenshot/PDF KRS (Kartu Rencana Studi) yang saya lampirkan ini.

Ubah seluruh mata kuliah dan jadwalnya menjadi data JSON murni dengan format array berikut:

[
  {
    "name": "Nama Mata Kuliah Lengkap",
    "code": "Kode MK (contoh: SI-101 jika ada)",
    "credits": 3,
    "day": "Senin",
    "startTime": "08:00",
    "endTime": "10:30",
    "room": "Ruang / Kelas (contoh: Ruang 401 / Lab Komputer)",
    "lecturer": "Nama Dosen Pengampu"
  }
]

Aturan:
1. Pastikan nama hari ditulis dalam bahasa Indonesia ("Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", atau "Minggu").
2. Format jam gunakan format 24 jam dengan tanda titik dua (contoh: "08:00", "13:30").
3. HANYA berikan teks kode JSON saja (jangan ada kalimat pengantar atau penutup).`;

