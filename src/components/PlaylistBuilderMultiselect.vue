<template>
  <div class="playlist-builder-row">
    <span class="playlist-builder-option-text">{{ text }}</span>
    <multiselect
      v-model="value"
      track-by="name"
      label="label"
      :options="options"
      :searchable="false"
      :close-on-select="true"
      :show-labels="false"
      :allow-empty="false"
      @input="$emit('onChange', value)"
    />
  </div>
</template>

<script>
export default {
  name: 'PlaylistBuilderMultiselect',

  props: {
    text: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    options: {
      type: Number,
      required: true
    }
  }
};
</script>
