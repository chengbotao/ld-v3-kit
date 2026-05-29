import type { App, AppContext, Component, Directive, Plugin } from 'vue';

export type SFCWithInstall<T> = T & Plugin;

export type SFCInstallWithContext<T> = SFCWithInstall<T> & {
  _context: AppContext | null;
};

export const withInstall = <T extends Component>(main: T) => {
  (main as SFCWithInstall<T>).install = (app: App): void => {
    app.component(main.name!, main);
  };

  return main as SFCWithInstall<T>;
};

export const withInstallFunction = <T extends Plugin>(fn: T, name: string) => {
  (fn as SFCInstallWithContext<T>).install = (app: App) => {
    (fn as SFCInstallWithContext<T>)._context = app._context;
    app.config.globalProperties[name] = fn;
  };

  return fn as SFCInstallWithContext<T>;
};

export const withInstallDirective = <T extends Directive>(directive: T, name: string) => {
  (directive as SFCWithInstall<T>).install = (app: App): void => {
    app.directive(name, directive);
  };

  return directive as SFCWithInstall<T>;
};
