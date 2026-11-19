import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class GameErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'Erro desconhecido' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh w-full bg-[#151C2E] text-[#FAF0D7] flex items-center justify-center p-6">
          <div className="wood-panel rounded-3xl p-5 max-w-sm w-full text-center space-y-3">
            <h1 className="font-cartoon text-xl text-[#FFE055]">Ops! O Caldeirão transbordou!</h1>
            <p className="text-xs font-bold text-[#FFC7C0] break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-cartoon btn-emerald font-cartoon text-white px-5 py-2.5 rounded-xl"
            >
              Recarregar Taverna
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameErrorBoundary>
      <App />
    </GameErrorBoundary>
  </React.StrictMode>
);
