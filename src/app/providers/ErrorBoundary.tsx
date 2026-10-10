import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { logger } from '@/lib/logger';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { logger.error(error, info.componentStack); }
  render() {
    return this.state.failed ? <ErrorState message="Something went wrong. Reload the page." onRetry={() => location.reload()} /> : this.props.children;
  }
}
