import { Component, ErrorInfo, ReactNode } from 'react';

import { Button } from '@shared/ui/button';

function ErrorBoundaryContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Что-то пошло не так</h2>
        <p className="text-gray-600 mb-6">Произошла ошибка при загрузке страницы. Пожалуйста, попробуйте снова.</p>

        <div className="flex items-center justify-center">
          <Button
            type="button"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorBoundaryContent />;
    }

    return this.props.children;
  }
}

export function RouterErrorBoundary() {
  return <ErrorBoundaryContent />;
}
