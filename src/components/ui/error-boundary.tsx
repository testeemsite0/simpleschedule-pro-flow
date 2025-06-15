
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Check for specific RLS recursion errors
    if (error.message?.includes('infinite recursion') || 
        error.message?.includes('policy') ||
        error.message?.includes('user_roles')) {
      console.warn('RLS policy error detected in ErrorBoundary');
      
      // Auto-retry after 2 seconds for RLS errors
      if (this.state.retryCount < 2) {
        this.retryTimeoutId = setTimeout(() => {
          this.handleAutoRetry();
        }, 2000);
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleReset = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: 0 
    });
  };

  handleAutoRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1 
    }));
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  isRLSError = () => {
    return this.state.error?.message?.includes('infinite recursion') || 
           this.state.error?.message?.includes('policy') ||
           this.state.error?.message?.includes('user_roles');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRLS = this.isRLSError();
      const canAutoRetry = this.state.retryCount < 2;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>
                {isRLS ? 'Problema Temporário de Configuração' : 'Algo deu errado'}
              </CardTitle>
              <CardDescription>
                {isRLS 
                  ? 'Detectamos um problema temporário com as configurações de segurança. Tentando corrigir automaticamente...'
                  : 'Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRLS && canAutoRetry && (
                <Alert>
                  <AlertDescription>
                    Tentativa {this.state.retryCount + 1}/3 - Correção automática em andamento...
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome} 
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir para Dashboard
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  Recarregar página
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\nStack trace:\n' + this.state.error.stack}
                    {this.state.errorInfo && '\n\nComponent stack:\n' + this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
