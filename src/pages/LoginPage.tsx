import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import {
  LogIn,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Handler Login Username
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn(username.trim(), password);
      if (result.error) {
        setError(result.error.message);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // Isi data demo Faisal Al Alim
  const handleFillDemo = () => {
    setUsername('faisal');
    setPassword('123');
    setError(null);
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
            Masuk ke SI-Acad
          </h1>
          <p className="text-xs sm:text-sm text-[#627F5C] dark:text-[#93AC91]">
            Kelola jadwal kuliah, tugas, dan rotasi kelompok
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              placeholder="Masukkan username Anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              icon={<LogIn className="w-4 h-4" />}
            >
              Masuk Sekarang
            </Button>
          </form>

          {/* Akses Cepat Akun Demo */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-[#7C9A76]/50 bg-[#E6EDE5]/40 dark:bg-[#1E251E] text-xs font-semibold text-[#4D6449] dark:text-[#A8C5A0] hover:bg-[#E6EDE5] dark:hover:bg-[#253025] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#7C9A76]" />
              <span>Coba Akun Demo (Faisal Al Alim)</span>
            </button>
          </div>

          {/* Footer Belum punya akun */}
          <div className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
            Belum memiliki akun?{' '}
            <Link
              to="/register"
              className="text-[#7C9A76] font-semibold hover:underline"
            >
              Daftar akun di sini
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

export default LoginPage;
