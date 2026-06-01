import type { ComponentPublicInstance } from 'vue';
import { withInstall } from '@ld-v3-kit/utils';
import Table from './src/LdTable.vue';
import TableColumn from './src/LdTableColumn.vue';
export * from './src/LdTable';

export const LdTable = withInstall(Table);
export const LdTableColumn = withInstall(TableColumn);

export type LdTableInstance = ComponentPublicInstance & InstanceType<typeof Table> & unknown;
