import { defineAsyncComponent } from 'vue';
import type { Theme } from 'vitepress';
// https://vitepress.dev/guide/custom-theme
import DefaultTheme from 'vitepress/theme';
// import DefaultTheme from 'vitepress/theme-without-fonts';
import ThemeLayout from './ThemeLayout.vue';
import './style.scss';
import LdV3Kit from 'ld-v3-kit';
import ElementPlus from 'element-plus';
import locale from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';

export default {
  extends: DefaultTheme,
  Layout: ThemeLayout,
  async enhanceApp({ app, router, siteData }) {
    if (!import.meta.env.SSR) {
      app.use(ElementPlus, {
        locale,
      });
      app.use(LdV3Kit);
      // 注册 DemoContainer
      app.component(
        'DemoContainer',
        defineAsyncComponent(() => import('./DemoContainer.vue')),
      );
      // 获取所有 demos 组件
      const modules = import.meta.glob('/packages/components/**/__demos__/*.vue');
      const demoModules: Record<string, () => Promise<unknown>> = {};
      for (const path in modules) {
        const demoPath = path.replace(
          /\/packages\/components\/(.*)(\/__demos__\/)(.*)\.vue/,
          '$1$2$3',
        );
        demoModules[demoPath] = modules[path];
      }
      app.provide('demoModules', demoModules);
    }
    if (router) {
      // TODO
    }
    if (siteData) {
      // TODO
    }
  },
} satisfies Theme;
