import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              {this.props.title || 'Panel Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Something went wrong rendering this component.
            <pre className="mt-2 text-[10px] break-all">
              {this.state.error?.message}
            </pre>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
