<script setup lang="ts">
export type FormFieldOption = {
  value: string | number
  label: string
}

withDefaults(
  defineProps<{
    label: string
    modelValue?: string | number | null
    as?: 'input' | 'textarea' | 'select'
    type?: string
    placeholder?: string
    required?: boolean
    readonly?: boolean
    disabled?: boolean
    error?: string
    hint?: string
    rows?: number
    options?: FormFieldOption[]
  }>(),
  {
    as: 'input',
    type: 'text',
    placeholder: '',
    required: false,
    readonly: false,
    disabled: false,
    error: '',
    hint: '',
    rows: 3,
    options: () => [],
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const controlClass =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-400 read-only:bg-slate-50 read-only:text-slate-700'

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}

const onSelect = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div>
    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
      {{ label }}<span v-if="required"> *</span>
    </label>

    <input
      v-if="as === 'input'"
      :value="modelValue ?? ''"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :readonly="readonly"
      :disabled="disabled"
      :class="controlClass"
      @input="onInput"
    />

    <textarea
      v-else-if="as === 'textarea'"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :required="required"
      :readonly="readonly"
      :disabled="disabled"
      :rows="rows"
      :class="controlClass"
      @input="onInput"
    />

    <select
      v-else
      :value="modelValue ?? ''"
      :required="required"
      :disabled="disabled"
      :class="controlClass"
      @change="onSelect"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
