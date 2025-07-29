function DarkModeToggle({ mode, setMode }: { mode: string; setMode: (m: 'light' | 'dark') => void }) {
  return (
    <div className="dark-toggle">
      <button
        aria-label="Light mode"
        className={mode === 'light' ? 'active' : ''}
        onClick={() => setMode('light')}
        title="Light mode"
        type="button"
      >
        <span role="img" aria-label="Light">🌞</span>
      </button>
      <button
        aria-label="Dark mode"
        className={mode === 'dark' ? 'active' : ''}
        onClick={() => setMode('dark')}
        title="Dark mode"
        type="button"
      >
        <span role="img" aria-label="Dark">🌙</span>
      </button>
    </div>
  );
}

export default DarkModeToggle; 