import installer from './defaults.ts';

export * from '@ld-v3-kit/components';
export * from '@ld-v3-kit/composables';
export * from '@ld-v3-kit/utils';

export const install = installer.install;
export const version = installer.version;
export default installer;
