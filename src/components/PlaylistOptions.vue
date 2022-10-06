<template>
  <div>
    <div class="selection-options">
      Here are your top artists and tracks:
      <multiselect
        v-model="selectionValue"
        track-by="name"
        label="label"
        class="selection-options__dropdown"
        :options="selectionOptions"
        :searchable="false"
        :close-on-select="true"
        :show-labels="false"
        :allow-empty="false"
        @input="getSeedOptions"
      >
      </multiselect>
    </div>
    <div class="playlist-options">
      <div
        class="playlist-item"
        :class="{
          'playlist-item-disabled': maxOptionsSelected && !isSelected(item),
        }"
        v-for="item in topCombined"
        :key="item"
        v-bind:style="{ backgroundImage: itemBackground(item) }"
        v-on:mouseenter="showInfo(item.id)"
        v-on:mouseleave="showInfo(null)"
        @click.prevent="clickItem(item)"
      >
        <div class="playlist-item--selected" v-if="isSelected(item)">
          <img
            class="playlist-selected__checkmark"
            src="../assets/checkmark.png"
          />
          <div class="playlist-item__title" v-if="hoveredOn === item.id">
            <b>{{ item.type.toUpperCase() }}</b>
            <br />
            <span> {{ titleCard(item) }} </span>
          </div>
        </div>
        <div v-else-if="hoveredOn === item.id" class="playlist-item__title">
          <b>{{ item.type.toUpperCase() }}</b>
          <br />
          <span> {{ titleCard(item) }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PlaylistBuilder',

  data() {
    return {
      topArtists: [],
      topTracks: [],
      topCombined: [],
      hoveredOn: null,
      maxOptions: 5,
      selectionOptions: [
        { name: 'medium_term', label: 'Past 6 months' },
        { name: 'short_term', label: 'Past month' },
        { name: 'long_term', label: 'All time' },
      ],
      selectionValue: { name: 'medium_term', label: 'Past 6 months' },
    };
  },

  props: {
    accessToken: {
      type: String,
      required: true,
    },
    selected: {
      type: Array,
      required: true,
    },
    playlistType: {
      type: Object,
      required: true,
    },
  },

  watch: {
    playlistType(type) {
      this.selected = [];
      if (type.name === 'top') {
        this.selected = this.topCombined.slice(0, 5);
      } else if (type.name === 'random') {
        let randomNumber;
        for (let i = 0; i < 5; i++) {
          randomNumber = Math.floor(Math.random() * this.topCombined.length);
          if (!this.selected.includes(this.topCombined[randomNumber])) {
            this.selected.push(this.topCombined[randomNumber]);
          } else if (this.topCombined.length >= 5) {
            // Restart iteration for new pick
            i -= 1;
          } else {
            // Less than 5 options, choose them all
            this.selected = this.topCombined;
          }
        }
      }
      this.$emit('selectedUpdated', this.selected);
    },
  },

  computed: {
    maxOptionsSelected() {
      return this.selected.length >= this.maxOptions;
    },
  },

  methods: {
    itemBackground(item) {
      if (item.type === 'artist' && item.images && item.images.length) {
        return `url(${item.images[0].url})`;
      } else if (
        item.type === 'track' &&
        item.album &&
        item.album.images &&
        item.album.images.length
      ) {
        return `url(${item.album.images[0].url})`;
      }
    },

    titleCard(item) {
      if (
        item.type === 'track' &&
        item.artists &&
        item.artists.length &&
        item.artists[0].name
      ) {
        return `${item.name} by ${item.artists[0].name}`;
      }

      return item.name;
    },

    showInfo(id) {
      this.hoveredOn = id;
    },

    isSelected(item) {
      return this.selected.some((x) => x['id'] === item.id);
    },

    clickItem(item) {
      let selectedChanged = false;
      if (this.isSelected(item)) {
        this.selected = this.selected.filter((x) => x.id !== item.id);
        selectedChanged = true;
      } else if (this.selected.length < this.maxOptions) {
        this.selected.push(item);
        selectedChanged = true;
      }

      if (selectedChanged) {
        this.$emit('selectedUpdated', this.selected);
      }
    },

    async getSeedOptions() {
      this.topArtists = await this.spotifyCall(
        'https://api.spotify.com/v1/me/top/artists'
      );
      this.topTracks = await this.spotifyCall(
        'https://api.spotify.com/v1/me/top/tracks'
      );
      this.topCombined = this.topArtists
        .map((element, index) => [element, this.topTracks[index]])
        .flat();

      this.selected.forEach((item) => {
        if (!this.topCombined.some((x) => x.id === item.id)) {
          this.topCombined.push(item);
        }
      });

      this.$emit('optionsUpdated', this.topCombined);
    },

    async spotifyCall(url) {
      let data = [];

      await axios
        .get(`${url}?limit=50&time_range=${this.selectionValue.name}`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })
        .then((response) => {
          data = response.data.items;
        })
        .catch((error) => {
          this.$emit('unauthorized');
        });
      return data;
    },
  },

  async created() {
    await this.getSeedOptions();
  },
};
</script>

<style lang="scss" scoped>
.selection-options {
  font-size: 13px;
  text-align: left;
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  .selection-options__dropdown {
    max-width: 100px;
    padding-left: 5px;
  }
}
.playlist-options {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow: scroll;
  margin-bottom: 35px;
  .playlist-item {
    height: 100px;
    width: 100px;
    background-repeat: no-repeat;
    background-size: cover;
    cursor: pointer;
    .playlist-item__title {
      flex-direction: column;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      background: #fff;
      font-size: 12px;
      opacity: 0.9;
      overflow: hidden;
    }
    .playlist-item--selected {
      height: 94%;
      width: 94%;
      border: 3px solid white;
      position: relative;
      .playlist-selected__checkmark {
        height: 20px;
        position: absolute;
        right: 5px;
        top: 5px;
      }
    }
  }
  .playlist-item-disabled {
    cursor: not-allowed;
  }
}

@media screen and (max-width: 600px) {
  .playlist-item {
    height: 50px !important;
    width: 50px !important;
  }
}
</style>
