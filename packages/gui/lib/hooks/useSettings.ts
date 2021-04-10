let settings;

export function useSettings(): [ any, CallableFunction ] {
  const setSettings = (newSettings) => {
    settings = newSettings;
  }

  return [settings, setSettings];
}
