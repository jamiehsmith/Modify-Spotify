<template>
  <div class="playlist-builder__container">
    <div class="builder__row">
      <UserInfo :userInfo="userInfo" />
      <div class="playlist-builder">
        <span class="playlist-builder__title">Playlist Builder</span>
        <PlaylistBuilderMultiselect
          text="Playlist type:"
          :value="playlistValue"
          :options="playlistOptions"
          @onChange="(value) => (playlistValue = value)"
        />
        <PlaylistBuilderTags
          text="Playlist seeds:"
          :value="tag"
          :selected="selected"
          :options="options"
          :error="showError"
          @updateTags="updateTags"
          @deleteTag="deleteTag"
        />
        <div v-if="showError" class="playlist-builder__row">
          <span class="error-text">
            This field cannot be empty. Choose artist(s) and/or track(s) from
            the right.
          </span>
        </div>
        <div class="playlist-builder__max-selected" v-if="maxOptionsSelected">
          Maximum of 5 options selected.
        </div>
        <PlaylistBuilderMultiselect
          text="Number of tracks:"
          :value="numberOfTracks"
          :options="numberOfTracksOptions"
          @onChange="(value) => (numberOfTracks = value)"
        />
        <div class="playlist-builder__row">
          <span class="playlist-builder__option-text">Playlist name:</span>
          <input
            class="playlist-builder__name"
            v-model="playlistName"
            placeholder="Enter name"
          />
        </div>
        <div class="playlist-builder__row">
          <button
            @click.prevent="makePlaylist"
            :disabled="isLoading"
            class="make-playlist__button"
          >
            <span>Make Playlist</span>
            <img
              class="playlist__loading-icon"
              v-if="isLoading"
              src="../assets/loading.gif"
            />
          </button>
          <button @click="reset" class="reset-playlist__button">
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
    <div class="playlist-builder__options">
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
import axios from 'axios';
import UserInfo from './UserInfo.vue';
import PlaylistOptions from './PlaylistOptions.vue';
import PlaylistBuilderMultiselect from './PlaylistBuilderMultiselect.vue';
import PlaylistBuilderTags from './PlaylistBuilderTags.vue';
import playlistMixin from '../lib/playlistMixin';

export default {
  name: 'PlaylistBuilder',

  mixins: [playlistMixin],

  components: {
    UserInfo,
    PlaylistOptions,
    PlaylistBuilderMultiselect,
    PlaylistBuilderTags,
  },

  data() {
    return {
      userInfo: {},
      tag: '',
      selected: [],
      isLoading: false,
      playlistName: '',
      playlistOptions: [
        { name: 'custom', label: 'Custom playlist' },
        { name: 'top', label: 'Top artists and songs' },
        { name: 'random', label: 'Surprise me!' },
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
    };
  },

  props: {
    accessToken: {
      type: String,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
  },

  methods: {
    async meCall(url) {
      let data = [];

      await axios
        .get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })
        .then((response) => {
          data = response.data;
        })
        .catch((error) => {
          this.unauthorized();
        });
      return data;
    },

    deleteTag(params) {
      this.selected = this.selected.filter(
        (x) => x.id !== params.tag.text.id && x.id !== params.tag.id
      );
    },

    updateTags(input) {
      this.showError = false;
      this.selected.push(input[input.length - 1]);
    },

    updateSelected(selected) {
      this.showError = false;
      this.selected = selected;
    },

    async spotifyPostCall(url, data = {}) {
      let resp = [];

      await axios
        .post(url, data, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          resp = response.data;
        })
        .catch((error) => {
          this.unauthorized();
        });
      return resp;
    },

    async spotifyGetSeeds(url, data = {}) {
      let resp = [];

      await axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          params: data,
        })
        .then((response) => {
          resp = response.data.tracks;
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.unauthorized();
          } else {
            this.noSuggestions();
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
        this.userId = $cookies.get('user_id');
      }

      let artists = [];
      let tracks = [];
      let names = [];

      artists = this.selected
        .filter((x) => x.type === 'artist')
        .map((x) => x.id);

      tracks = this.selected.filter((x) => x.type === 'track').map((x) => x.id);

      names = this.selected.map((x) => x.name);

      let url = 'https://api.spotify.com/v1/recommendations';
      let data = {
        seed_tracks: tracks.join(','),
        seed_artists: artists.join(','),
        limit: this.numberOfTracks.name,
      };

      let playlistTracks = await this.spotifyGetSeeds(url, data);

      if (playlistTracks.length) {
        playlistTracks = playlistTracks.map((x) => x.uri);

        if (!this.playlistName.length) {
          this.playlistName = 'ModifySpotify Mix';
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
            uris: playlistTracks,
          });

          let playlistTracksResp = await this.spotifyPostCall(url, data);

          if (playlistTracksResp) {
            const twitterShare = `https://twitter.com/intent/tweet?url=${playlistResp.external_urls.spotify}&text=Check%20out%20this%20playlist%20I%20made%20on%20modifyspotify.com`;
            const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${playlistResp.external_urls.spotify}`;

            let span = document.createElement('span');
            span.innerHTML = `<a href="${playlistResp.external_urls.spotify}" target="_blank">Click here to view playlist</a><div class="share-playlist">Share this playlist:<div class="share-icons"><a href="${twitterShare}" target="_blank"><div class="twitter-icon"></div><a href="${facebookShare}" target="_blank"><div class="facebook-icon"></div></div></div>`;

            this.$swal({
              title: `${this.playlistName} playlist created!`,
              content: span,
              allowOutsideClick: 'true',
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
      let allOptions = options.map((item) => {
        let i = Object.assign({}, item);
        i.text = item.name;
        return i;
      });

      allOptions.forEach((i) => {
        if (!this.options.some((x) => x.id === i.id)) {
          this.options.push(i);
        }
      });
    },

    noSuggestions() {
      this.$swal({
        icon: 'error',
        title: 'Oops...',
        text:
          'Spotify did not return any song recommendations. Please change your selection and try again.',
      });
    },
  },
  async created() {
    this.userInfo = await this.meCall();
    this.userId = this.userInfo.id;
    $cookies.set('user_id', this.userInfo.id);
  },
};
</script>

<style lang="scss" scoped>
.playlist-builder__container {
  display: flex;
  .builder__row {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 315px;
    overflow-y: scroll;
    height: 100vh;
    z-index: 2;
    .playlist-builder {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5px 8px 0px 0px;
      font-size: 12px;
      .playlist-builder__title {
        font-size: 16px;
        padding: 10px;
      }
      .playlist-builder__row {
        padding-top: 5px;
        display: flex;
        white-space: nowrap;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      .playlist-builder-selection {
        width: 100%;
        /deep/ .vue-tags-input {
          width: 74%;
          .ti-tag,
          ti-content {
            background-color: #04dc5c;
          }
          .ti-tag {
            overflow-x: hidden;
          }
          .ti-content {
            overflow: hidden;
          }
          .ti-content,
          .ti-tag-center {
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
            font-family: Avenir, Helvetica, Arial, sans-serif;
            font-size: 12px;
          }
          .ti-new-tag-input-wrapper {
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
      .error-text {
        white-space: normal;
        color: red;
      }
      .playlist-builder__max-selected {
        padding-top: 5px;
      }
      .playlist-builder__option-text {
        padding-right: 5px;
      }
      .playlist-builder__name {
        border: 1px solid #e8e8e8;
        font-family: Avenir, Helvetica, Arial, sans-serif;
        font-size: 12px;
        padding-left: 10px;
        border-radius: 5px;
        height: 33px;
        outline: none;
        width: 100%;
      }
      .make-playlist__button,
      .reset-playlist__button {
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

      .make-playlist__button {
        align-items: center;
        display: flex;
        &:disabled {
          cursor: not-allowed;
        }
        .playlist__loading-icon {
          height: 15px;
          padding-left: 5px;
        }
      }
    }
  }
  .playlist-builder__options {
    display: flex;
    height: 100vh;
    overflow: scroll;
  }
}

body {
  height: 100vh;
  overflow: hidden;
}

body::-webkit-scrollbar,
.builder__row::-webkit-scrollbar,
.playlist-builder__options::-webkit-scrollbar,
.playlist-options::-webkit-scrollbar {
  display: none;
}

.share-playlist {
  padding-top: 10px;
  .share-icons {
    display: flex;
    justify-content: center;
    .twitter-icon {
      margin: 5px;
      width: 35px;
      height: 35px;
      background-image: url('../assets/twitter.png');
      background-size: cover;
      background-repeat: no-repeat;
      border: none;
    }
    .facebook-icon {
      margin: 5px;
      width: 35px;
      height: 35px;
      background-image: url('../assets/facebook.png');
      background-size: cover;
      background-repeat: no-repeat;
      border: none;
    }
  }
}

@media screen and (max-width: 600px) {
  .playlist-builder__container {
    flex-direction: column;
    .builder__row {
      height: 100%;
      height: -moz-available; /* WebKit-based browsers will ignore this. */
      height: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
      height: fill-available;
    }
  }
  .playlist-item {
    height: 50px !important;
    width: 50px !important;
  }
  .selection-options {
    font-size: 12px !important;
  }
}
</style>
