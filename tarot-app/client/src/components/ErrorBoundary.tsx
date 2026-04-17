import { Component, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <DefaultErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error: Error | null }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔮</div>
        <h1 className="text-2xl font-bold mb-3 text-purple-300">{t('errorBoundary.title')}</h1>
        <p className="text-gray-400 mb-6">{t('errorBoundary.message')}</p>
        {error && (
          <p className="text-xs text-gray-600 mb-6 font-mono break-all">
            {error.name}: {error.message}
          </p>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
        >
          {t('errorBoundary.reload')}
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
