import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-white/80 dark:bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 max-w-lg w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Something went wrong loading this view
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {this.state.error?.message || 'Unknown runtime error'}
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 mx-auto shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
