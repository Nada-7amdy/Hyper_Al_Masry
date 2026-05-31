import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error("Uncaught exception caught by GlobalErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-right" dir="rtl">
          <div className="max-w-md w-full bg-[#121212] border border-red-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500"></div>
            
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 mx-auto animate-pulse">
              <ShieldAlert size={32} />
            </div>

            <h1 className="text-2xl font-serif font-bold text-center mb-2 text-gray-100">
              عذراً، حدث خطأ غير متوقع في النظام!
            </h1>
            <p className="text-xs text-gray-400 text-center mb-6">
              لقد قام نظام حماية بوابة هايبر المصري تلقائياً برصد المشكلة وعزلها لمنع فقدان البيانات.
            </p>

            <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-6 font-mono text-[10px] text-red-400/90 overflow-auto max-h-32 text-left" dir="ltr">
              {this.state.error && this.state.error.toString()}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-black font-bold text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              إعادة تهيئة النظام فوراً
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
