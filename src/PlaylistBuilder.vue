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
      <div> Builder will be here </div>
    </div>
    <div id="playlist-builder">
      <div id="playlist-options">
        <div class="playlist-item"
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
      selected: [],
  	}
  },

  props: {
  	accessToken: {
      type: String,
      required: true,
  	}
  },

  computed: {
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

    showInfo(id) {
        this.hoveredOn = id;
    },

    isSelected(item) {
      return this.selected.some(x => x['id'] === item.id);
    },

    clickItem(item) {
      if (this.isSelected(item)) {
        this.selected = this.selected.filter(x => x.id !== item.id);
      } else {
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
  },

  async created() {
    this.userInfo = await this.spotifyCall('https://api.spotify.com/v1/me');
    this.topArtists = await this.spotifyCall('https://api.spotify.com/v1/me/top/artists', true);
  	this.topTracks = await this.spotifyCall('https://api.spotify.com/v1/me/top/tracks', true);
    this.topCombined = this.topArtists.map((element, index) => [element, this.topTracks[index]]).flat();
  }
}
</script>

<style lang="scss">
#playlist-builder-container {
  display: flex;
  #user-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 350px;
    #user-info-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5px;
    }
    #user-image {
      padding: 10px;
      max-height: 100px;
      border-radius: 50%;
    }
    #user-name {
      font-size: 20px;
    }
    #user-info-row {
      display: flex;
      align-items: center;
      font-size: 14px;
      #user-info-separator {
        font-size: 20px;
        padding: 4px;
      }
    }
  }
  #playlist-builder {
    display: flex;
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
    }
  }
}
</style>