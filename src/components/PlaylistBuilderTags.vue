<template>
  <div class="playlist-builder-selection playlist-builder__row">
    <span class="playlist-builder__option-text">{{ text }}</span>
    <vue-tags-input
      v-model="value"
      :tags="selected"
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
import playlistMixin from '../lib/playlistMixin';

export default {
  name: 'PlaylistBuilderTags',

  mixins: [playlistMixin],

  data() {
    return {
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
    selected: {
      type: Array,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    error: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    filteredItems() {
      return this.options.filter((i) => {
        return i.name.toLowerCase().indexOf(this.value.toLowerCase()) !== -1;
      });
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
