import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import useGroups from '../hooks/useGroups';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Users, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export const JoinGroupPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { joinGroupByCode } = useGroups();

  const codeFromUrl = searchParams.get('code') || '';
  const [code, setCode] = useState(codeFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await joinGroupByCode(code.trim());
      if (res.error) {
        setError(res.error.message || 'Kode undangan tidak valid atau Anda sudah bergabung.');
      } else {
        navigate('/groups');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal bergabung.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <Link
        to="/groups"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Kelompok
      </Link>

      <Card padding="lg" variant="bordered">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#E6EDE5] dark:bg-[#202C20] flex items-center justify-center text-[#4D6449] dark:text-[#A8C5A0] mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Gabung Kelompok Belajar
          </h2>
          <p className="text-xs text-gray-500">
            Kamu diundang untuk bergabung ke dalam kelompok perkuliahan di SI-Acad
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <Input
            label="Kode Undangan Kelompok"
            placeholder="Masukkan kode..."
            value={code}
            onChange={(e) => setCode(e.target.value.toLowerCase())}
            required
            className="font-mono text-center text-lg uppercase tracking-wider"
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
            disabled={!code.trim()}
            icon={<UserCheck className="w-4 h-4" />}
          >
            Gabung Kelompok Sekarang
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default JoinGroupPage;

