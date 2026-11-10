import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import {
  UserPlus,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & Feedback States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setError('Silakan tentukan username Anda.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(cleanUser, password, fullName.trim(), {
        isEmail: false,
        studentId: studentId.trim() || '-',
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        // Akun langsung aktif, langsung masuk ke dashboard
        navigate('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-[#FAFAF7] dark:bg-[#141814] safe-area-pb safe-area-pt">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo variant="icon" size="lg" className="w-16 h-16" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Daftar Akun SI-Acad
          </h1>
          <p className="text-xs sm:text-sm text-[#627F5C] dark:text-[#93AC91]">
            Kelola jadwal kuliah, tugas, dan rotasi kelompok dengan mudah
          </p>
        </div>

        {/* Card Form */}
        <Card variant="bordered" padding="lg">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="NPM / NIM Mahasiswa (Opsional)"
              placeholder="Contoh: 12410222685"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />

            <Input
              label="Username"
              placeholder="Contoh: vina / budi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />

            <Input
              label="Password (min. 6 karakter)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Input
              label="Ulangi Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <div className="p-3 rounded-xl bg-[#E6EDE5]/60 dark:bg-[#202C20] text-[11px] text-[#4D6449] dark:text-[#A8C5A0] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#7C9A76]" />
              <span>
                Akun langsung aktif seketika tanpa perlu verifikasi email.
              </span>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={loading}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Daftar Akun
            </Button>
          </form>

          {/* Footer Kembali ke Login */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
            Sudah memiliki akun?{' '}
            <Link
              to="/login"
              className="text-[#7C9A76] font-semibold hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-600">
          SI-Acad &copy; 2026 — Modern Academic Planner
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
