import type { App } from 'vue'
import VAutoComplete from './VAutoComplete.vue'

export { VAutoComplete }
export default VAutoComplete

export interface VAutoCompleteProps<T> {
  modelValue: string
  fetchOptions?: (query: string) => Promise<T[]>
  items?: T[]
  placeholder?: string
  labelKey?: string
  valueKey?: string
  excludeValues?: string[]
}

export interface VAutoCompleteEmits<T> {
  (e: 'update:modelValue', value: string): void
  (e: 'select', option?: T): void
  (e: 'search', query: string): void
  (e: 'error', error: unknown): void
}

export const install = (app: App) => {
  app.component('VAutoComplete', VAutoComplete)
}

if (typeof window !== 'undefined' && (window as any).Vue) {
  install((window as any).Vue)
}
