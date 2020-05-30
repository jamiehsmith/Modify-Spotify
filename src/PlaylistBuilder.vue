<template>
  <div id="playlist-builder-container">
    <div id="builder-row">
      <div id="user-info">
        <img id="user-image"
          :v-if="userImage"
          :src="userImage"
        />
        <div id="user-info-text">
          <span id="user-name" 
            :v-if="userInfo.display_name"
          >
            {{ userInfo.display_name }}
          </span>
          <span id="user-info-row">
            <span :v-if="userFollowers">
              Followers: {{ userFollowers }}
            </span>
            <span id="user-info-separator"
             :v-if="userFollowers && userProfileUrl"
            >
              &middot;
            </span>
            <span :v-if="userProfileUrl">
              <a :href="userProfileUrl" target="_blank">Profile</a>
            </span>
          </span>
        </div>
      </div>
      <div id="playlist-builder">
        <span id="playlist-builder-title">Playlist Builder</span>
        <div class="playlist-builder-row">
          <span class="playlist-builder-option-text">Playlist type:</span>
          <multiselect
            v-model="playlistValue"
            track-by="name"
            label="label"
            :options="playlistOptions"
            :searchable="false"
            :close-on-select="true"
            :show-labels="false"
            :allow-empty="false"
            @input="onChangePlaylistType"
          >
          </multiselect>
        </div>
        <div id="playlist-builder-selection" class="playlist-builder-row">
          <span class="playlist-builder-option-text">Playlist options:</span>
          <vue-tags-input
            v-model="tag"
            :tags="selected"
            :max-tags="maxOptions"
            :placeholder="tagPlaceholder"
            @tags-changed="newTags => tags = newTags"
            @before-deleting-tag="deleteTag"
          >
            <div slot="tag-center" slot-scope="props">
              {{ props.tag.text.name }}
            </div>
          </vue-tags-input>
        </div>
        <div
          id="playlist-builder-max-selected"
          v-if="maxOptionsSelected"
        >
          Maximum of 5 options selected.
        </div>
        <div class="playlist-builder-row">
          <span class="playlist-builder-option-text">Playlist name:</span>
          <input id="playlist-builder-name" v-model="message" placeholder="Enter name">
        </div>
        <div class="playlist-builder-row">
          <button v-on:click="makePlaylist" id="make-playlist-button">
            <span id="login-button-text">Make Playlist</span>
          </button>
        </div>
      </div>
    </div>
    <div id="playlist-builder-options">
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
          v-on:click="clickItem(item)"
        >
          <div class="playlist-item-title"
           v-if="hoveredOn === item.id"
          >
            <b>{{ item.type.toUpperCase() }}</b>
            <br>
            <span v-if="item.type === 'track' && item.artists && item.artists.length && item.artists[0].name">
              {{ item.name }} by {{ item.artists[0].name }}
            </span>
            <span v-else>
              {{ item.name }}
            </span>
          </div>
          <div v-if="isSelected(item)">
            SELECTED
          </div>
        </div>
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
      userInfo: {},
      topArtists: [],
      topTracks: [],
      topCombined: [],
      hoveredOn: null,
      tag: '',
      selected: [],
      maxOptions: 5,
      tagPlaceholder: '',
      playlistOptions: [
        { name: 'custom', label: 'Custom playlist' },
        { name: 'top', label: 'Top artists and songs' },
        { name: 'random', label: 'Surprise me!' }
      ],
      playlistValue: { name: 'custom', label: 'Custom playlist' },
  	}
  },

  props: {
  	accessToken: {
      type: String,
      required: true,
  	}
  },

  computed: {
    selectedFormatted() {
      return this.selected.map(item => item.name);
    },

    queryParams() {
      return 'limit=50';
    },

    userImage() {
      if (this.userInfo.images && this.userInfo.images.length) {
        return this.userInfo.images[0].url;
      }
    },

    userFollowers() {
      if (this.userInfo.followers && this.userInfo.followers.total) {
        return this.userInfo.followers.total;
      }
    },

    userProfileUrl() {
      if (this.userInfo.external_urls && this.userInfo.external_urls.spotify) {
        return this.userInfo.external_urls.spotify;
      } 
    },

    maxOptionsSelected() {
      return this.selected.length >= this.maxOptions;
    }
  },

  methods: {
    deleteTag(params) {
      this.selected = this.selected.filter(x => x.id !== params.tag.text.id);
    },

    onChangePlaylistType(type) {
      this.selected =[];
      if (type.name === 'top') {
        this.selected = this.topCombined.slice(0, 5);
      } else if (type.name === 'random') {
        for (let i = 0; i < 5; i++) {
          this.selected.push(this.topCombined[Math.floor(Math.random() * this.topCombined.length)]);
        }
      }
    },

    itemBackground(item) {
      if (item.type === 'artist' && item.images && item.images.length) {
        return `url(${item.images[0].url})`;
      } else if (item.type === 'track' && item.album
          && item.album.images && item.album.images.length) {
        return `url(${item.album.images[0].url})`;
      }
    },

    showInfo(id) {
        this.hoveredOn = id;
    },

    isSelected(item) {
      return this.selected.some(x => x['id'] === item.id);
    },

    clickItem(item) {
      if (this.isSelected(item)) {
        this.selected = this.selected.filter(x => x.id !== item.id);
      } else if (this.selected.length < this.maxOptions) {
        this.selected.push(item);
      }
    },

    async spotifyCall(url, items=false) {
      const self = this;
      let data = [];

      if (items) {
        url = `${url}?${this.queryParams}`;
      }

      await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + this.accessToken
        }
      }).then(function (response) {
        data = items ? response.data.items : response.data;
      })
      .catch(function (error) {
        self.$emit('unauthorized');
      });
      return data;
    },

    makePlaylist() {
      console.log('to do', this.selected);
    },
  },

  async created() {
    this.userInfo = await this.spotifyCall('https://api.spotify.com/v1/me');
    this.topArtists = await this.spotifyCall('https://api.spotify.com/v1/me/top/artists', true);
  	this.topTracks = await this.spotifyCall('https://api.spotify.com/v1/me/top/tracks', true);
    this.topCombined = this.topArtists.map((element, index) => [element, this.topTracks[index]]).flat();
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss">
#playlist-builder-container {
  display: flex;
  #builder-row {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 300px;
    #playlist-builder {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5px 8px 0px 0px;
      font-size: 12px;
      #playlist-builder-title {
        font-size: 16px;
        padding: 10px;
      }
      .playlist-builder-row {
        padding-top: 5px;
        display: flex;
        white-space: nowrap;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      #playlist-builder-selection {
        width: 100%;
        .vue-tags-input {
          width: 100%;
          .ti-tag, ti-content {
            background-color: #04dc5c;
          }
          .ti-input {
            border-radius: 5px;
          }
        }
      }
      #playlist-builder-max-selected {
        padding-top: 5px;
      }
      .playlist-builder-option-text {
        padding-right: 5px;
      }
      #playlist-builder-name {
        border: 1px solid #ccc;
        font-family: Avenir,Helvetica,Arial,sans-serif;
        font-size: 12px;
        padding-left: 10px;
        border-radius: 5px;
        height: 40px;
        outline: none;
        width: 100%;
      }
      #make-playlist-button {
        padding: 10px;
        margin-top: 5px;
        outline: none;
        border-radius: 5px;
        background-color: white;
        color: #2c3e50;
        cursor: pointer;
        border: 1px solid #ccc;
      }
    }
  }
  #user-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: auto;
    padding: 5px;
    justify-content: center;
    #user-info-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5px;
    }
    #user-image {
      padding: 5px;
      max-height: 100px;
      border-radius: 50%;
    }
    #user-name {
      font-size: 16px;
    }
    #user-info-row {
      display: flex;
      align-items: center;
      font-size: 12px;
      white-space: nowrap;
      #user-info-separator {
        font-size: 20px;
        padding: 4px;
      }
    }
  }
  #playlist-builder-options {
    display: flex;
    height: 100vh;
    overflow: scroll;
    #playlist-options {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
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
      }
      .playlist-item-disabled {
        cursor: not-allowed;
      }
    }
  }
}

#playlist-builder-options::-webkit-scrollbar { 
    display: none;
}

body {
  height: 100vh;
  overflow: hidden;
}

body::-webkit-scrollbar { 
    display: none;
}

.multiselect {
  min-width: 150px;
  .multiselect__tags {
    min-height: 20px;
  }
  .multiselect__content-wrapper {
    overflow-x: hidden;
  }
  .multiselect__input {
    width: fit-content;
  }
  .multiselect__single, .multiselect__content-wrapper {
    font-size: 12px;
  }
  .multiselect__element {
    margin: 0px;
  }
  .multiselect__option--selected.multiselect__option--highlight {
    background: #f3f3f3;
    color: #35495e;
  }
}

@media screen and (max-width: 600px) {
  #playlist-builder-container {
    flex-direction: column;
  }
  #user-image {
    max-height: 50px !important;
  }
  .playlist-item {
    height: 50px !important;
    width: 50px !important;
  }
}
</style>