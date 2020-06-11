<template>
  <div id="playlist-options">
    <div
      :class="{
        'playlist-item': true,
        'playlist-item-disabled': maxOptionsSelected && !isSelected(item)
      }"
      v-for="item in topCombined" :key="item"
      v-bind:style="{ backgroundImage: itemBackground(item) }"
      v-on:mouseenter="showInfo(item.id)"
      v-on:mouseleave="showInfo(null)"
      v-on:click.prevent="clickItem(item)"
    >
      <div class="playlist-item-selected" v-if="isSelected(item)">
        <img class="playlist-selected-checkmark" src="./assets/checkmark.png"/>
        <div class="playlist-item-title"
         v-if="hoveredOn === item.id"
        >
          <b>{{ item.type.toUpperCase() }}</b>
          <br>
          <span> {{ titleCard(item) }} </span>
        </div>
      </div>
      <div v-else-if="hoveredOn === item.id" class="playlist-item-title">
        <b>{{ item.type.toUpperCase() }}</b>
        <br>
        <span> {{ titleCard(item) }} </span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PlaylistBuilder',

  data () {
	  return {
      topArtists: [],
      topTracks: [],
      topCombined: [],
      hoveredOn: null,
      maxOptions: 5,
  	}
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
    }
  },

  watch: {
    'playlistType': function(type) {
      this.selected =[];
      if (type.name === 'top') {
        this.selected = this.topCombined.slice(0, 5);
      } else if (type.name === 'random') {
        for (let i = 0; i < 5; i++) {
          this.selected.push(this.topCombined[Math.floor(Math.random() * this.topCombined.length)]);
        }
      }
      this.$emit('selectedUpdated', this.selected);
    }
  },

  computed: {
    maxOptionsSelected() {
      return this.selected.length >= this.maxOptions;
    }
  },

  methods: {
    itemBackground(item) {
      if (item.type === 'artist' && item.images && item.images.length) {
        return `url(${item.images[0].url})`;
      } else if (item.type === 'track' && item.album
          && item.album.images && item.album.images.length) {
        return `url(${item.album.images[0].url})`;
      }
    },

    titleCard(item) {
      if (item.type === 'track' && item.artists && item.artists.length && item.artists[0].name) {
        return `${item.name} by ${item.artists[0].name}`
      }

      return item.name;
    },

    showInfo(id) {
      this.hoveredOn = id;
    },

    isSelected(item) {
      return this.selected.some(x => x['id'] === item.id);
    },

    clickItem(item) {
      let selectedChanged = false;
      if (this.isSelected(item)) {
        this.selected = this.selected.filter(x => x.id !== item.id);
        selectedChanged = true;
      } else if (this.selected.length < this.maxOptions) {
        this.selected.push(item);
        selectedChanged = true;
      }

      if (selectedChanged) {
        this.$emit('selectedUpdated', this.selected);
      }
    },

    async spotifyCall(url) {
      const self = this;
      let data = [];

      await axios.get(`${url}?limit=50`, {
        headers: {
          Authorization: 'Bearer ' + this.accessToken
        }
      }).then(function (response) {
        data = response.data.items;
      })
      .catch(function (error) {
        self.$emit('unauthorized');
      });
      return data;
    },
  },

  async created() {
    this.topArtists = await this.spotifyCall('https://api.spotify.com/v1/me/top/artists');
  	this.topTracks = await this.spotifyCall('https://api.spotify.com/v1/me/top/tracks');
    this.topCombined = this.topArtists.map((element, index) => [element, this.topTracks[index]]).flat();
  }
}
</script>

<style lang="scss">
#playlist-options {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow: scroll;
  .playlist-item {
    height: 100px;
    width: 100px;
    background-repeat: no-repeat;
    background-size: cover;
    cursor: pointer;
    .playlist-item-title {
      flex-direction: column;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      background: #fff;
      font-size: 12px;
      opacity: .9;
      overflow: hidden;
    }
    .playlist-item-selected {
      height: 94%;
      width: 94%;
      border: 3px solid white;
      position: relative;
      .playlist-selected-checkmark {
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