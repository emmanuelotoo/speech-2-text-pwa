import React, { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const prompt = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setDeferred(null);
  };

  if (installed) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
      <h2 className="font-medium">Install</h2>
      <p className="text-sm text-slate-600">Install SpeakWrite to your device for a native-like experience.</p>
      <button
        className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        onClick={prompt}
        disabled={!deferred}
      >
        {deferred ? 'Install App' : 'Install not available'}
      </button>
    </div>
  );
}


