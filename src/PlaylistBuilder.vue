<template>
  <div id="playlist-builder-container">
    <div id="builder-row">
      <UserInfo
        :accessToken="accessToken"
        :userInfo="userInfo"
      />
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
          >
          </multiselect>
        </div>
        <div id="playlist-builder-selection" class="playlist-builder-row">
          <span class="playlist-builder-option-text">Playlist seeds:</span>
          <vue-tags-input
            v-model="tag"
            :tags="selected"
            :max-tags="maxOptions"
            :placeholder="!maxOptionsSelected ? tagPlaceholder : ''"
            :class="{'show-error': showError}"
            :autocomplete-items="filteredItems"
            :add-only-from-autocomplete="true"
            @tags-changed="updateTags"
            @before-deleting-tag="deleteTag"
          >
            <div slot="tag-center" slot-scope="props">
              {{ formatTags(props.tag) }}
            </div>
            <div slot="autocomplete-item" slot-scope="props">
              {{ formatTags(props.item) }}
            </div>
          </vue-tags-input>
        </div>
        <div v-if="showError" class="playlist-builder-row">
          <span id="error-text">This field cannot be empty. Choose artist(s) and/or track(s) from the right.</span>
        </div>
        <div
          id="playlist-builder-max-selected"
          v-if="maxOptionsSelected"
        >
          Maximum of 5 options selected.
        </div>
        <div class="playlist-builder-row">
          <span class="playlist-builder-option-text">Number of tracks:</span>
          <multiselect
            v-model="numberOfTracks"
            track-by="name"
            label="label"
            :options="numberOfTracksOptions"
            :searchable="false"
            :close-on-select="true"
            :show-labels="false"
            :allow-empty="false"
          >
          </multiselect>
        </div>
        <div class="playlist-builder-row">
          <span class="playlist-builder-option-text">Playlist name:</span>
          <input id="playlist-builder-name" v-model="playlistName" placeholder="Enter name">
        </div>
        <div class="playlist-builder-row">
          <button v-on:click.prevent="makePlaylist" :disabled="isLoading" id="make-playlist-button">
            <span>Make Playlist</span>
            <img id="playlist-loading-icon" v-if="isLoading" src="./assets/loading.gif"/>
          </button>
          <button v-on:click="reset" id="reset-playlist-button">
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
    <div id="playlist-builder-options">
      <PlaylistOptions
        :accessToken="accessToken"
        :selected="selected"
        :playlistType="playlistValue"
        @selectedUpdated="updateSelected"
        @unauthorized="unauthorized"
        @optionsUpdated="updateOptions"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import UserInfo from './UserInfo.vue'
import PlaylistOptions from './PlaylistOptions.vue'
import VueCookies from 'vue-cookies'

export default {
  name: 'PlaylistBuilder',

  components: {
    UserInfo,
    PlaylistOptions,
  },

   data () {
    return {
      userInfo: {},
      tag: '',
      selected: [],
      isLoading: false,
      maxOptions: 5,
      tagPlaceholder: 'Select artists or tracks',
      playlistName: '',
      playlistOptions: [
        { name: 'custom', label: 'Custom playlist' },
        { name: 'top', label: 'Top artists and songs' },
        { name: 'random', label: 'Surprise me!' }
      ],
      playlistValue: { name: 'custom', label: 'Custom playlist' },
      numberOfTracks: { name: '25', label: '25' },
      numberOfTracksOptions: [
        { name: '25', label: '25' },
        { name: '50', label: '50' },
        { name: '100', label: '100' },
      ],
      showError: false,
      options: [],
  	}
  },

  props: {
  	accessToken: {
      type: String,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    }
  },

  computed: {
    maxOptionsSelected() {
      return this.selected.length >= this.maxOptions;
    },
    filteredItems() {
      return this.options.filter(i => {
        return i.name.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
      });
    }
  },

  methods: {
    async meCall(url) {
      const self = this;
      let data = [];

      await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: 'Bearer ' + this.accessToken
        }
      }).then(function (response) {
        data = response.data;
      })
      .catch(function (error) {
        self.unauthorized();
      });
      return data;
    },

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

    formatAutocompleteTag(tag) {
      if (tag.type === 'track') {
        return this.formatTrack(tag);
      }
      return tag.text;
    },

    deleteTag(params) {
      this.selected = this.selected.filter(x => x.id !== params.tag.text.id && x.id !== params.tag.id);
    },

    updateTags(input) {
      this.showError = false;
      this.selected.push(input[input.length -1]);
    },

    updateSelected(selected) {
      this.showError = false;
      this.selected = selected;
    },

    async spotifyPostCall(url, data={}) {
      const self = this;
      let resp = [];

      await axios.post(url, data, {
        headers: {
          Authorization: 'Bearer ' + this.accessToken,
          'Content-Type': 'application/json'
        },
      }).then(function (response) {
        resp = response.data;
      })
      .catch(function (error) {
        self.unauthorized();
      });
      return resp;
    },

    async spotifyGetSeeds(url, data={}) {
      const self = this;
      let resp = [];

      await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + this.accessToken
        },
        params: data,
      }).then(function (response) {
        resp = response.data.tracks;
      })
      .catch(function (error) {
        if (error.response.status === 401) {
          self.unauthorized();
        } else {
          self.noSuggestions();
        }
      });
      return resp;
    },

    async makePlaylist() {
      if (!this.selected.length) {
        this.showError = true;
        return;
      }

      this.isLoading = true;

      if (!this.userId) {
        this.userId = VueCookies.get('user_id');
      }

      let artists = [];
      let tracks = [];
      let names = [];

      artists = this.selected
        .filter(x => x.type === 'artist')
        .map(x => x.id);

      tracks = this.selected
        .filter(x => x.type === 'track')
        .map(x => x.id);

      names = this.selected.map(x => x.name);

      let url = 'https://api.spotify.com/v1/recommendations';
      let data = {
        'seed_tracks': tracks.join(','),
        'seed_artists': artists.join(','),
        'limit': this.numberOfTracks.name,
      }

      let playlistTracks = await this.spotifyGetSeeds(url, data);

      if (playlistTracks.length) {
        playlistTracks = playlistTracks.map(x => x.uri);

        if (!this.playlistName.length) {
          this.playlistName = "ModifySpotify Mix";
        }

        url = `https://api.spotify.com/v1/users/${this.userId}/playlists`;

        data = JSON.stringify({
          name: this.playlistName,
          description: `${names.join(' x ')} #ModifySpotify`,
          public: 'true',
        });

        let playlistResp = await this.spotifyPostCall(url, data);

        if (playlistResp) {
          url = `https://api.spotify.com/v1/users/${this.userId}/playlists/${playlistResp.id}/tracks`;
          data = JSON.stringify({
            'uris': playlistTracks,
          });

          let playlistTracksResp = await this.spotifyPostCall(url, data);

          if (playlistTracksResp) {
            const twitterShare = `https://twitter.com/intent/tweet?url=${playlistResp.external_urls.spotify}&text=Check%20out%20this%20playlist%20I%20made%20on%20ModifySpotify.com`;
            const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${playlistResp.external_urls.spotify}`;

            let span = document.createElement("span");
            span.innerHTML = `<a href="${playlistResp.external_urls.spotify}" target="_blank">Click here to view playlist</a><div id="share-playlist">Share this playlist:<div id="share-icons"><a href="${twitterShare}" target="_blank"><div id="twitter-icon"></div><a href="${facebookShare}" target="_blank"><div id="facebook-icon"></div></div></div>`;

            this.$swal({
                title: `${this.playlistName} playlist created!`,
                content: span,
                allowOutsideClick: "true"
            });
          }
        }
      }

      this.isLoading = false;
    },

    reset() {
      this.selected = [];
      this.showError = false;
      this.playlistValue = this.playlistOptions[0];
      this.numberOfTracks = this.numberOfTracksOptions[0];
      this.playlistName = '';
    },

    unauthorized() {
      this.$emit('unauthorized');
    },

    updateOptions(options) {
      let self = this;
      let allOptions = options.map(function(item) {
        let i = Object.assign({}, item);
        i.text = item.name;
        return i;
      });

      allOptions.forEach(function(i) {
        if (!self.options.some(x => x.id === i.id)) {
          self.options.push(i);
        }
      });
    },

    noSuggestions() {
      this.$swal({
        icon: 'error',
        title: 'Oops...',
        text: 'Spotify did not return any song recommendations. Please change your selection and try again.',
      })
    },
  },
  async created() {
    this.userInfo = await this.meCall();
    this.userId = this.userInfo.id;
    VueCookies.set('user_id', this.userInfo.id);
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
    min-width: 315px;
    overflow-y: scroll;
    height: 100vh;
    z-index: 2;
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
          width: 74%;
          .ti-tag, ti-content {
            background-color: #04dc5c;
          }
          .ti-tag {
            overflow-x: hidden;
          }
          .ti-content, .ti-tag-center {
            width: 100%;
          }
          .ti-tag-center > div {
            text-overflow: ellipsis;
            overflow-x: hidden;
          }
          .ti-input {
            border-radius: 5px;
            border: 1px solid #e8e8e8;
          }
          &.show-error {
            .ti-input {
              border: 1px solid red;
            }
          }
          .ti-autocomplete {
            ul {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .ti-item {
              background-color: lightpink;
              width: fit-content;
              margin: 1px;
              max-width: 100%;
              div {
                text-overflow: ellipsis;
                overflow: hidden;
              }
            }
          }
          .ti-new-tag-input {
            font-family: Avenir,Helvetica,Arial,sans-serif;
            font-size: 12px;
          }
          .ti-new-tag-input-wrapper {
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
      #error-text {
        white-space: normal;
        color: red;
      }
      #playlist-builder-max-selected {
        padding-top: 5px;
      }
      .playlist-builder-option-text {
        padding-right: 5px;
      }
      #playlist-builder-name {
        border: 1px solid #e8e8e8;;
        font-family: Avenir,Helvetica,Arial,sans-serif;
        font-size: 12px;
        padding-left: 10px;
        border-radius: 5px;
        height: 33px;
        outline: none;
        width: 100%;
      }
      #make-playlist-button, #reset-playlist-button {
        padding: 10px;
        margin-top: 5px;
        outline: none;
        border-radius: 5px;
        background-color: white;
        color: #2c3e50;
        cursor: pointer;
        border: 1px solid #e8e8e8;
        margin: 5px;
      }

      #make-playlist-button {
        align-items: center;
        display: flex;
        &:disabled {
          cursor: not-allowed;
        }
        #playlist-loading-icon {
          height: 15px;
          padding-left: 5px;
        }
      }
    }
  }
  #playlist-builder-options {
    display: flex;
    height: 100vh;
    overflow: scroll;
  }
}

body {
  height: 100vh;
  overflow: hidden;
}

body::-webkit-scrollbar, #builder-row::-webkit-scrollbar, #playlist-builder-options::-webkit-scrollbar, #playlist-options::-webkit-scrollbar {
    display: none;
}

.multiselect {
  min-width: 150px;
  max-height: 33px;
  min-height: 20px;
  .multiselect__select {
    top: -3px;
  }
  .multiselect__tags {
    min-height: 20px;
    max-height: 33px;
    padding: 6px 40px 0 6px;
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

.swal-modal {
  .swal-title {
    font-family: Avenir,Helvetica,Arial,sans-serif;
    font-weight: 500;
    font-size: 20px;
  }
  .swal-content, .swal-text {
    font-family: Avenir,Helvetica,Arial,sans-serif;
  }

  .swal-text {
    text-align: center;
  }

  .swal-footer {
    display: flex;
    justify-content: center;
  }
}

#share-playlist {
  padding-top: 10px;
  #share-icons {
    display: flex;
    justify-content: center;
    #twitter-icon {
      margin: 5px;
      width: 35px;
      height: 35px;
      background-image: url('./assets/twitter.png');
      background-size: cover;
      background-repeat: no-repeat;
      border: none;
    }
    #facebook-icon {
      margin: 5px;
      width: 35px;
      height: 35px;
      background-image: url('./assets/facebook.png');
      background-size: cover;
      background-repeat: no-repeat;
      border: none;
    }
  }
}

@media screen and (max-width: 600px) {
  #playlist-builder-container {
    flex-direction: column;
    #builder-row {
      height: 100%;
      height: -moz-available;          /* WebKit-based browsers will ignore this. */
      height: -webkit-fill-available;  /* Mozilla-based browsers will ignore this. */
      height: fill-available;
    }
  }
  .playlist-item {
    height: 50px !important;
    width: 50px !important;
  }
}
</style>