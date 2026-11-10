import { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Copy,
  Check,
  ExternalLink,
  Download,
  AlertCircle,
  Clock,
  MapPin,
  User,
  ArrowRight,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import {
  ParsedKrsItem,
  parseGeminiText,
  parseExcelFile,
  downloadExcelTemplate,
  GEMINI_KRS_PROMPT,
} from '../../lib/krsParser';

interface ImportScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (items: ParsedKrsItem[]) => Promise<void>;
}

export const ImportScheduleModal = ({
  isOpen,
  onClose,
  onImportSuccess,
}: ImportScheduleModalProps) => {
  const [activeTab, setActiveTab] = useState<'gemini' | 'excel'>('gemini');
  const [geminiInput, setGeminiInput] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [previewItems, setPreviewItems] = useState<ParsedKrsItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state saat modal ditutup
  const handleClose = () => {
    setPreviewItems([]);
    setSelectedIndices(new Set());
    setError(null);
    setGeminiInput('');
    onClose();
  };

  // Salin prompt ke clipboard
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(GEMINI_KRS_PROMPT);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  // Buka Gemini AI di tab baru
  const handleOpenGemini = () => {
    window.open('https://gemini.google.com', '_blank');
  };

  // Set hasil parsing dan centang semua item secara default
  const applyParsedItems = (items: ParsedKrsItem[]) => {
    setPreviewItems(items);
    setSelectedIndices(new Set(items.map((_, i) => i)));
  };

  // Proses teks dari Gemini
  const handleProcessGeminiText = () => {
    setError(null);
    if (!geminiInput.trim()) {
      setError('Silakan tempel teks hasil dari Gemini terlebih dahulu.');
      return;
    }

    const items = parseGeminiText(geminiInput);
    if (items.length === 0) {
      setError(
        'Format teks belum dikenali. Pastikan Anda menyalin seluruh teks kode JSON yang diberikan oleh Gemini.'
      );
      return;
    }

    applyParsedItems(items);
  };

  // Proses upload file Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const items = await parseExcelFile(file);
      if (items.length === 0) {
        setError(
          'Tidak ada data mata kuliah yang ditemukan dalam file Excel. Pastikan file memiliki kolom Nama Mata Kuliah dan Hari.'
        );
        return;
      }
      applyParsedItems(items);
    } catch (err: unknown) {
      setError('Gagal membaca file Excel. Pastikan format file adalah .xlsx atau .csv');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Centang / Batal Centang mata kuliah
  const toggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  // Pilih Semua atau Batal Pilih Semua
  const toggleSelectAll = () => {
    if (selectedIndices.size === previewItems.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(previewItems.map((_, i) => i)));
    }
  };

  // Silang / Hapus satu mata kuliah dari daftar
  const handleRemoveItem = (indexToRemove: number) => {
    const updated = previewItems.filter((_, idx) => idx !== indexToRemove);
    setPreviewItems(updated);

    // Perbarui index yang terpilih
    const nextSelected = new Set<number>();
    let newIdx = 0;
    previewItems.forEach((_, oldIdx) => {
      if (oldIdx !== indexToRemove) {
        if (selectedIndices.has(oldIdx)) {
          nextSelected.add(newIdx);
        }
        newIdx++;
      }
    });
    setSelectedIndices(nextSelected);
  };

  // Konfirmasi simpan jadwal yang dipilih
  const handleConfirmImport = async () => {
    const itemsToSave = previewItems.filter((_, idx) => selectedIndices.has(idx));
    if (itemsToSave.length === 0) {
      setError('Silakan pilih minimal 1 mata kuliah untuk disimpan ke jadwal.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onImportSuccess(itemsToSave);
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan jadwal ke database.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    {
      id: 'gemini',
      label: 'Foto / PDF KRS via Gemini AI',
      icon: <ExternalLink className="w-4 h-4" />,
    },
    {
      id: 'excel',
      label: 'Upload Excel / CSV',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Jadwal & KRS Cepat"
      size="lg"
    >
      <div className="space-y-5">
        {/* Step Indicator / Tabs */}
        {previewItems.length === 0 && (
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(t) => {
              setActiveTab(t as typeof activeTab);
              setError(null);
            }}
          />
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ===================== VIEW 1: PRATINJAU HASIL PARSING ===================== */}
        {previewItems.length > 0 ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#E6EDE5] dark:bg-[#1E271E] border border-[#7C9A76]/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[#4D6449] dark:text-[#A8C5A0]">
                  Terdeteksi {previewItems.length} Jadwal Mata Kuliah ({selectedIndices.size} Dipilih)
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Hilangkan centang atau klik tanda silang (✕) pada mata kuliah yang tidak Anda ambil.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-[#4D6449] dark:text-[#A8C5A0] hover:underline font-semibold cursor-pointer px-2 py-1 rounded"
                >
                  {selectedIndices.size === previewItems.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreviewItems([]);
                    setSelectedIndices(new Set());
                  }}
                >
                  Ulangi
                </Button>
              </div>
            </div>

            {/* List preview items dengan tombol silang (X) & checkbox */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {previewItems.map((item, idx) => {
                const isSelected = selectedIndices.has(idx);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-gray-50/80 dark:bg-[#181F18] border-gray-200/80 dark:border-gray-800'
                        : 'bg-gray-100/50 dark:bg-[#121612] border-gray-200/40 dark:border-gray-800/40 opacity-50'
                    }`}
                  >
                    {/* Checkbox & info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleSelect(idx)}
                        className="text-[#7C9A76] hover:text-[#5B8A5B] transition-colors cursor-pointer shrink-0"
                        title={
                          isSelected
                            ? 'Hilangkan centang untuk tidak mengambil mata kuliah ini'
                            : 'Centang untuk mengambil mata kuliah ini'
                        }
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#7C9A76]" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold truncate ${
                              isSelected
                                ? 'text-gray-900 dark:text-gray-100'
                                : 'text-gray-400 dark:text-gray-500 line-through'
                            }`}
                          >
                            {item.courseName}
                          </span>
                          {item.courseCode && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-200/60 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300">
                              {item.courseCode}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500">
                            ({item.credits || 3} SKS)
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
                          <span
                            className={`font-semibold flex items-center gap-1 ${
                              isSelected ? 'text-[#7C9A76]' : 'text-gray-400'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {item.dayName}, {item.startTime} - {item.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {item.room || 'Kampus'}
                          </span>
                          {item.lecturer && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <User className="w-3 h-3 text-gray-400" />
                              {item.lecturer}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tombol Silang (X) untuk menghapus mata kuliah dari daftar */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                      title="Silang / Hapus mata kuliah ini dari daftar import"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button variant="ghost" onClick={handleClose} disabled={saving}>
                Batal
              </Button>
              <Button
                onClick={handleConfirmImport}
                loading={saving}
                disabled={selectedIndices.size === 0}
                icon={<Check className="w-4 h-4" />}
              >
                Simpan & Terapkan ({selectedIndices.size} Mata Kuliah)
              </Button>
            </div>
          </div>
        ) : (
          /* ===================== VIEW 2: PILIHAN INPUT (GEMINI AI VS EXCEL) ===================== */
          <>
            {/* TAB 1: PANDUAN GEMINI AI */}
            {activeTab === 'gemini' && (
              <div className="space-y-4">
                {/* Panduan 3 Langkah */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1a221a] border border-gray-200/80 dark:border-gray-800 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    Cara Mudah Ekstrak Jadwal dari Foto / Screenshot / PDF KRS:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    <li>
                      Salin instruksi prompt di bawah, lalu buka <strong>Gemini AI</strong>.
                    </li>
                    <li>
                      Di Gemini, <strong>unggah foto screenshot KRS</strong> atau <strong>file PDF KRS</strong> Anda, lalu tempel prompt.
                    </li>
                    <li>
                      Gemini akan menghasilkan data jadwal dalam hitungan detik. <strong>Salin hasilnya</strong> dan tempel ke kotak di bawah.
                    </li>
                  </ol>

                  {/* Action Buttons for Prompt & Gemini */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPrompt}
                      icon={copiedPrompt ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    >
                      {copiedPrompt ? 'Prompt Berhasil Disalin!' : '1. Salin Prompt Gemini'}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleOpenGemini}
                      icon={<ExternalLink className="w-4 h-4" />}
                    >
                      2. Buka Gemini AI &rarr;
                    </Button>
                  </div>
                </div>

                {/* Textarea untuk menempel hasil dari Gemini */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    3. Tempel Teks Hasil dari Gemini di Sini:
                  </label>
                  <textarea
                    rows={5}
                    value={geminiInput}
                    onChange={(e) => setGeminiInput(e.target.value)}
                    placeholder='Tempel teks JSON atau tabel dari Gemini di sini... Contoh: [{"name": "Basis Data", "day": "Senin", "startTime": "08:00", "endTime": "10:30", "room": "Lab 1"}]'
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161D16] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7C9A76] font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="ghost" onClick={handleClose}>
                    Batal
                  </Button>
                  <Button
                    onClick={handleProcessGeminiText}
                    disabled={!geminiInput.trim()}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Tinjau Jadwal
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: UPLOAD FILE EXCEL / CSV */}
            {activeTab === 'excel' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />

                {/* Drag and Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-[#7C9A76] dark:hover:border-[#7C9A76] bg-gray-50/50 dark:bg-[#181F18] text-center cursor-pointer transition-colors space-y-2"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E6EDE5] dark:bg-[#232F23] flex items-center justify-center text-[#7C9A76]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Klik untuk Memilih File Excel atau CSV
                  </h4>
                  <p className="text-xs text-gray-500">
                    Mendukung format file <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>
                  </p>
                </div>

                {/* Download Template Banner */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1a221a] border border-gray-200/80 dark:border-gray-800 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      Butuh format contoh file Excel?
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Unduh template resmi SI-Acad yang sudah terisi kolom mata kuliah, hari, jam, dan ruangan.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={downloadExcelTemplate}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Unduh Template
                  </Button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="ghost" onClick={handleClose}>
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default ImportScheduleModal;
