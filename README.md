# Vue 3 Autocomplete Component

A flexible and customizable autocomplete component for Vue 3 with TypeScript support.

## Features

- 🔍 **Search as you type** with debounced input
- ⚡ **Async data loading** support
- 🎨 **Customizable option rendering** with slots
- ⌨️ **Keyboard navigation** (Arrow keys, Enter, Tab, Escape)
- 🎯 **TypeScript support** with full type safety
- 📱 **Responsive design** with loading states
- 🚫 **Exclude values** functionality
- 🔧 **Highly configurable** props

## Installation

```bash
npm install @ducnd.dev/vue-autocomplete
```

## Usage

### Basic Usage

```vue
<template>
  <VAutoComplete
    v-model="selectedValue"
    :items="options"
    placeholder="Search..."
    label-key="name"
    value-key="id"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VAutoComplete } from '@ducnd.dev/vue-autocomplete'
import '@ducnd.dev/vue-autocomplete/dist/vue-autocomplete.css'

const selectedValue = ref('')
const options = ref([
  { id: '1', name: 'Option 1' },
  { id: '2', name: 'Option 2' },
  { id: '3', name: 'Option 3' }
])

const onSelect = (option: any) => {
  console.log('Selected:', option)
}
</script>
```

### Async Data Loading

```vue
<template>
  <VAutoComplete
    v-model="selectedValue"
    :fetch-options="fetchUsers"
    placeholder="Search users..."
    label-key="name"
    value-key="id"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VAutoComplete } from '@ducnd.dev/vue-autocomplete'

interface User {
  id: string
  name: string
  email: string
}

const selectedValue = ref('')

const fetchUsers = async (query: string): Promise<User[]> => {
  const response = await fetch(`/api/users?q=${query}`)
  return response.json()
}

const onSelect = (user: User) => {
  console.log('Selected user:', user)
}
</script>
```

### Custom Option Rendering

```vue
<template>
  <VAutoComplete
    v-model="selectedValue"
    :items="users"
    label-key="name"
    value-key="id"
  >
    <template #option="{ option }">
      <div class="user-option">
        <div class="user-name">{{ option.name }}</div>
        <div class="user-email">{{ option.email }}</div>
      </div>
    </template>
  </VAutoComplete>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | The current selected value (v-model) |
| `fetchOptions` | `(query: string) => Promise<T[]>` | `undefined` | Async function to fetch options based on query |
| `items` | `T[]` | `[]` | Static array of options |
| `placeholder` | `string` | `''` | Input placeholder text |
| `labelKey` | `string` | `'label'` | Key to use for displaying option text |
| `valueKey` | `string` | `'value'` | Key to use for option values |
| `excludeValues` | `string[]` | `[]` | Array of values to exclude from results |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted when the selected value changes (v-model) |
| `select` | `T` | Emitted when an option is selected |
| `search` | `string` | Emitted when the user types in the input |
| `error` | `unknown` | Emitted when an error occurs during async data loading |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `option` | `{ option: T }` | Custom rendering for each option item |

## Keyboard Navigation

- **Arrow Down/Up**: Navigate through options
- **Enter/Tab**: Select the highlighted option
- **Escape**: Close the dropdown and blur input

## Styling

The component comes with default styles, but you can customize them by overriding the CSS classes:

```css
.autocomplete {
  /* Container */
}

.autocomplete-input {
  /* Input field */
}

.autocomplete-list {
  /* Dropdown list */
}

.autocomplete-item {
  /* Individual option */
}

.autocomplete-item.active {
  /* Highlighted option */
}

.loading-spinner {
  /* Loading indicator */
}
```

## TypeScript Support

The component is fully typed and exports the necessary interfaces:

```typescript
import type { VAutoCompleteProps } from '@ducnd.dev/vue-autocomplete'

interface MyOption {
  id: string
  name: string
}

// Props are properly typed based on your option type
const props: VAutoCompleteProps<MyOption> = {
  modelValue: '',
  items: [],
  labelKey: 'name',
  valueKey: 'id'
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
