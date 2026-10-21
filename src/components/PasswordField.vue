<template>
  <v-text-field
    v-bind="$attrs"
    :model-value="modelValue"
    :type="visible ? 'text' : 'password'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #append-inner>
      <button
        type="button"
        class="toggle"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        :aria-pressed="visible"
        @click="visible = !visible"
      >
        <component :is="visible ? EyeOff : Eye" :size="20" />
      </button>
    </template>
  </v-text-field>
</template>

<script setup>
import { ref } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'

defineOptions({ inheritAttrs: false })
defineProps({ modelValue: { type: String, default: '' } })
defineEmits(['update:modelValue'])

const visible = ref(false)
</script>

<style scoped>
.toggle {
  display: grid;
  place-items: center;
  padding: 4px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--ink-text-muted);
  cursor: pointer;
}

.toggle:hover {
  color: var(--ink-primary);
}
</style>
