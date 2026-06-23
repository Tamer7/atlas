export default function AppLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        color: 'var(--ink)',
      }}
      aria-busy="true"
      aria-label="Loading"
    />
  );
}
