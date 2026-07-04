import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeSettings } from '../firebase/services';
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  isCategoryVisible,
  getVisibleCategoryIds,
} from '../utils/siteSettings';
import { CATEGORY_TABS, CAT_CARDS } from '../data/menuData';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, id: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = subscribeSettings((data) => {
      setSettings(normalizeSettings(data));
      setLoaded(true);
    });
    return unsub;
  }, []);

  const visibleCategoryIds = useMemo(
    () => getVisibleCategoryIds(settings),
    [settings],
  );

  const visibleCategoryTabs = useMemo(
    () => CATEGORY_TABS.filter((t) => isCategoryVisible(settings, t.id)),
    [settings],
  );

  const visibleCatCards = useMemo(
    () => CAT_CARDS.filter((c) => isCategoryVisible(settings, c.id)),
    [settings],
  );

  const value = useMemo(() => ({
    settings,
    loaded,
    spinnerOfferEnabled: settings.spinnerOfferEnabled !== false,
    hiddenCategories: settings.hiddenCategories || [],
    visibleCategoryIds,
    visibleCategoryTabs,
    visibleCatCards,
    isCategoryVisible: (id) => isCategoryVisible(settings, id),
  }), [settings, loaded, visibleCategoryIds, visibleCategoryTabs, visibleCatCards]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
