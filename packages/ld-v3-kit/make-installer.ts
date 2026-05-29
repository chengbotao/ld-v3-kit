import { version } from './package.json';

import type { App, Plugin } from 'vue';

export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App, _options?: Record<string, unknown>) => {
    components.forEach((c) => app.use(c));
  };

  return {
    version,
    install,
  };
};
