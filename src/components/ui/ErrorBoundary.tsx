import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SI-Acad Uncaught Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-[#FAFAF7] dark:bg-[#141814] text-gray-900 dark:text-gray-100">
          <div className="max-w-md w-full bg-white dark:bg-[#1A221A] rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/80 dark:border-gray-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
              Terjadi Kendala Teknis
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aplikasi mengalami kendala yang tidak terduga saat memuat data. Jangan khawatir, data pribadi dan tugas Anda tetap tersimpan dengan aman di database.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </Button>
              <Button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

