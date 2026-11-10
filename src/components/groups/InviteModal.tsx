import { useState } from 'react';
import { Copy, Check, RefreshCw, Share2, Link as LinkIcon } from 'lucide-react';
import { StudyGroup } from '../../types/database';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface InviteModalProps {
  group: StudyGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onRegenerateCode: (groupId: string) => Promise<{ data?: string | null; error?: unknown }>;
  isOwner?: boolean;
}

export const InviteModal = ({
  group,
  isOpen,
  onClose,
  onRegenerateCode,
  isOwner = false,
}: InviteModalProps) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  if (!group) return null;

  const inviteLink = `${window.location.origin}/groups/join?code=${group.invite_code}`;

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleRegenerate = async () => {
    if (window.confirm('Buat kode undangan baru? Kode lama tidak akan bisa dipakai lagi.')) {
      setRegenerating(true);
      try {
        await onRegenerateCode(group.id);
      } finally {
        setRegenerating(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Undang Anggota — ${group.name}`} size="md">
      <div className="space-y-5">
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Bagikan kode atau tautan undangan berikut kepada teman kelompokmu. Anggota yang sudah memiliki akun SI-Acad dapat langsung bergabung ke kelompok ini.
        </p>

        {/* 1. Invite Code Box */}
        <div className="p-4 rounded-2xl bg-[#E6EDE5]/60 dark:bg-[#1C251C] border border-[#B2C5B0] dark:border-[#2D3B2D] text-center space-y-2">
          <p className="text-[11px] font-semibold text-[#4D6449] dark:text-[#A8C5A0] uppercase tracking-wider">
            Kode Undangan Kelompok
          </p>
          <div className="text-3xl font-mono font-bold tracking-widest text-gray-900 dark:text-gray-100 select-all">
            {group.invite_code}
          </div>
          <button
            onClick={() => copyToClipboard(group.invite_code, 'code')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#253023] text-xs font-semibold text-[#4D6449] dark:text-[#A8C5A0] border border-[#D0DDD0] dark:border-[#3E503A] shadow-2xs hover:bg-[#F4F7F4] cursor-pointer transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>

        {/* 2. Direct Link */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Tautan Cepat (Direct Link)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141814] text-gray-700 dark:text-gray-300 select-all focus:outline-none"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(inviteLink, 'link')}
              icon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
            >
              {copiedLink ? 'Tersalin' : 'Salin Link'}
            </Button>
          </div>
        </div>

        {/* 3. Owner Actions */}
        {isOwner && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">Sebagai ketua, Anda dapat memperbarui kode jika bocor.</p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span>Ganti Kode</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default InviteModal;

