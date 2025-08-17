<template>
   <div class="autocomplete">
    <input
      type="text"
      v-model="searchTerm"
      :placeholder="placeholder"
      @input="onSearch"
      class="autocomplete-input"
      @focus="isForced = true"
      @blur="handleBlur"
      @keydown="handleKeydown"
      ref="inputRef"
    />
    <div v-if="isLoading" class="loading-spinner">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle
          class="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="31.416"
          stroke-dashoffset="31.416"
        />
      </svg>
    </div>
    <ul v-if="isForced && !isLoading" class="autocomplete-list" ref="listRef">
      <li
        v-for="(option, index) in optionsData"
        :key="index"
        @click="selectOption(option)"
        class="autocomplete-item"
        :class="{ active: selectedIndex === index }"
        :ref="(el) => setItemRef(el as HTMLElement | null, index)"
      >
        <slot name="option" :option="option">
          {{ option[labelKey as keyof typeof option] }}
        </slot>
      </li>
      <li v-if="!optionsData.length" class="autocomplete-item">No results found</li>
    </ul>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { VAutoCompleteEmits, VAutoCompleteProps } from './index';
defineOptions({ name: 'VAutoComplete' })

const props = defineProps<VAutoCompleteProps<T>>()

const emits = defineEmits<VAutoCompleteEmits<T>>()


const searchTerm = ref('')
const options = ref<T[]>(props.items || [])

const labelKey = (props.labelKey || 'label') as keyof T
const valueKey = (props.valueKey || 'value') as keyof T
const isForced = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLUListElement | null>(null)
const selectedIndex = ref(-1)
const itemRefs = ref<(HTMLElement | null)[]>([])
const isLoading = ref(false)
const timeouts = new Set<ReturnType<typeof setTimeout>>()
const optionsData = computed(() => {
  const data = searchTerm.value
    ? options.value.filter((item) => {
        const labelValue = (item as T)[labelKey]
        return typeof labelValue === 'string'
          ? labelValue.toLowerCase().includes(searchTerm.value.toLowerCase())
          : false
      })
    : props.items || []
  return data.filter((item) => {
    if (props.excludeValues && props.excludeValues.length) {
      return !props.excludeValues.includes(
        (item as Record<string, unknown>)[valueKey as string] as string,
      )
    }
    return true
  })
})

onMounted(() => {
  loadOptions('')
})

onUnmounted(() => {
  timeouts.forEach(clearTimeout)
  timeouts.clear()
})

const setItemRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    itemRefs.value[index] = el
  }
}

const scrollToItem = async (index: number) => {
  await nextTick()
  const listElement = listRef.value
  const itemElement = itemRefs.value[index]

  if (!listElement || !itemElement) return

  listElement.getBoundingClientRect()
  itemElement.getBoundingClientRect()

  const listTop = listElement.scrollTop
  const listHeight = listElement.clientHeight
  const itemHeight = itemElement.offsetHeight
  const itemTop = itemElement.offsetTop

  if (itemTop < listTop) {
    listElement.scrollTop = itemTop
  } else if (itemTop + itemHeight > listTop + listHeight) {
    listElement.scrollTop = itemTop + itemHeight - listHeight
  }
}

const handleKeydown = async (e: KeyboardEvent) => {
  if (!isForced.value || !optionsData.value.length) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      const newDownIndex = Math.min(selectedIndex.value + 1, options.value.length - 1)
      selectedIndex.value = newDownIndex
      await scrollToItem(newDownIndex)
      break

    case 'ArrowUp':
      e.preventDefault()
      const newUpIndex = Math.max(selectedIndex.value - 1, 0)
      selectedIndex.value = newUpIndex
      await scrollToItem(newUpIndex)
      break

    case 'Enter':
      e.preventDefault()
      if (selectedIndex.value >= 0 && selectedIndex.value < options.value.length) {
        selectOption(options.value[selectedIndex.value])
      }
      break
    case 'Tab':
      e.preventDefault()
      if (selectedIndex.value >= 0 && selectedIndex.value < options.value.length) {
        selectOption(options.value[selectedIndex.value])
      }
      break

    case 'Escape':
      e.preventDefault()
      isForced.value = false
      selectedIndex.value = -1
      inputRef.value?.blur()
      break
  }
}

const loadOptions = async (query: string) => {
  try {
    isLoading.value = true
    let propsOptions: T[] = []
    if (props.fetchOptions) {
      propsOptions = await props.fetchOptions(query)
    }
    options.value = propsOptions
    selectedIndex.value = -1
    itemRefs.value = []
  } catch (error) {
    emits('error', error)
  } finally {
    isLoading.value = false
  }
}

const handleBlur = () => {
  setTimeout(() => {
    isForced.value = false
    selectedIndex.value = -1
  }, 300)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
      timeouts.delete(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
      timeouts.delete(timeout)
    }, delay)
    timeouts.add(timeout)
  }
}

const onSearch = debounce((e: Event) => {
  if (isLoading.value) return
  if (!isForced.value) {
    isForced.value = true
  }
  const target = e.target as HTMLInputElement
  emits('search', target.value)
  if (!target.value) {
    options.value = []
    selectedIndex.value = -1
    emits('update:modelValue', '')
    emits('select', undefined)
    return
  }
  loadOptions(target.value)
}, 300)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectOption = (option: any) => {
  emits('update:modelValue', option[valueKey] as string)
  emits('select', option)
  searchTerm.value = option[labelKey] as string
  isForced.value = false
  selectedIndex.value = -1
}

watch(
  () => props.modelValue,
  async (val) => {
    if (props.modelValue) {
      const selectedOption = options.value.find(
        (option) => (option as Record<string, unknown>)[valueKey as string] === val,
      )
      if (selectedOption) {
        searchTerm.value = (selectedOption as Record<string, unknown>)[labelKey as string] as string
      }
    } else {
      searchTerm.value = ''
    }
  },
  { immediate: true },
)

watch(
  isForced,
  () => {
    if (!searchTerm.value) {
      loadOptions('')
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.loading-spinner {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  z-index: 10;
}
.autocomplete {
  position: relative;
  width: 100%;
}
.autocomplete-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.autocomplete-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  list-style-type: none;
  z-index: 1000;
  margin: 0;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  scroll-behavior: smooth;
}
.autocomplete-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}
.autocomplete-item:last-child {
  border-bottom: none;
}
.autocomplete-item:hover {
  background-color: #f8f9fa;
}
.autocomplete-item.active {
  background-color: #007bff;
  color: white;
}
.autocomplete-item.active:hover {
  background-color: #0056b3;
}
</style>
