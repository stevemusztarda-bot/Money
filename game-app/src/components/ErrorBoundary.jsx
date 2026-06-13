import { Component } from 'react';

// Łapie błędy renderowania, żeby cała aplikacja nie znikała na białym ekranie.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('GamePicker — błąd renderowania:', error, info);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            color: '#fff',
            background: '#060611',
          }}
        >
          <div style={{ fontSize: 56 }}>💥</div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Ups, coś poszło nie tak</h1>
          <p style={{ color: '#888', maxWidth: 420, margin: 0 }}>
            Aplikacja napotkała nieoczekiwany błąd. Spróbuj odświeżyć albo
            zresetować widok.
          </p>
          <pre
            style={{
              maxWidth: 480,
              overflow: 'auto',
              fontSize: 12,
              color: '#a78bfa',
              background: '#ffffff08',
              border: '1px solid #ffffff14',
              borderRadius: 12,
              padding: 12,
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 24px',
              borderRadius: 999,
              fontWeight: 600,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg,#6c63ff,#a855f7)',
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
