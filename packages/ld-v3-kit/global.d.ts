declare module 'vue' {
  // GlobalComponents for Volar
  export interface GlobalComponents {
    LdTable: (typeof import('ld-v3-kit'))['LdTable'];
  }

  interface ComponentCustomProperties {}
}

export {};
