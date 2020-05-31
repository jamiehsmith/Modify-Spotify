<template>
  <div id="playlist-builder-container">
    <div id="builder-row">
      <UserInfo
        :accessToken="accessToken"
        @unauthorized="unauthorized"
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
      <PlaylistOptions
        :accessToken="accessToken"
        :selected="selected"
        :playlistType="playlistValue"
        @selectedUpdated="updateSelected"
        @unauthorized="unauthorized"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import UserInfo from './UserInfo.vue'
import PlaylistOptions from './PlaylistOptions.vue'

export default {
  name: 'PlaylistBuilder',

  components: {
    UserInfo,
    PlaylistOptions,
  },

   data () {
	  return {
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
    maxOptionsSelected() {
      return this.selected.length >= this.maxOptions;
    }
  },

  methods: {
    deleteTag(params) {
      this.selected = this.selected.filter(x => x.id !== params.tag.text.id);
    },

    updateSelected(selected) {
      this.selected = selected;
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
        self.unauthorized();
      });
      return data;
    },

    makePlaylist() {
      console.log('to do', this.selected);
    },

    unauthorized() {
      this.$emit('unauthorized');
    },
  },

  async created() {
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
  #playlist-builder-options {
    display: flex;
    height: 100vh;
    overflow: scroll;
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
  .playlist-item {
    height: 50px !important;
    width: 50px !important;
  }
}
</style>