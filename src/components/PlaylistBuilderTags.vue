<template>
  <div class="playlist-builder-selection playlist-builder__row">
    <span class="playlist-builder__option-text">{{ text }}</span>
    <vue-tags-input
      v-model="value"
      :tags="tags"
      :max-tags="maxOptions"
      :placeholder="!maxOptionsSelected ? tagPlaceholder : ''"
      :class="{ 'show-error': error }"
      :autocomplete-items="filteredItems"
      :add-only-from-autocomplete="true"
      @tags-changed="(obj) => $emit('updateTags', obj)"
      @before-deleting-tag="(obj) => $emit('deleteTag', obj)"
    >
      <div slot="tag-center" slot-scope="props">
        {{ formatTags(props.tag) }}
      </div>
      <div slot="autocomplete-item" slot-scope="props">
        {{ formatTags(props.item) }}
      </div>
    </vue-tags-input>
  </div>
</template>

<script>
export default {
  name: 'PlaylistBuilderTags',

  data() {
    return {
      maxOptions: 5,
      tagPlaceholder: 'Select artists or tracks',
    };
  },

  props: {
    text: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    },
    filteredItems: {
      type: Array,
      required: true,
    },
    error: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    maxOptionsSelected() {
      return this.tags.length >= this.maxOptions;
    },
  },

  methods: {
    formatTags(tag) {
      if (tag.hasOwnProperty('text') && typeof tag.text === 'object') {
        tag = tag.text;
      }

      if (tag.type === 'track') {
        return this.formatTrack(tag);
      }

      return tag.name;
    },

    formatTrack(tag) {
      return `${tag.name} by ${tag.artists[0].name}`;
    },
  },
};
</script>
