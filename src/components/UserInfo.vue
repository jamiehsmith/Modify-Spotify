<template>
  <div id="user-info">
    <img id="user-image" :v-if="userImage" :src="userImage" />
    <div id="user-info-text">
      <span id="user-name" :v-if="userInfo.display_name">
        {{ userInfo.display_name }}
      </span>
      <span id="user-info-row">
        <span :v-if="userFollowers"> Followers: {{ userFollowers }} </span>
        <span id="user-info-separator" :v-if="userFollowers && userProfileUrl">
          &middot;
        </span>
        <span :v-if="userProfileUrl">
          <a :href="userProfileUrl" target="_blank">Profile</a>
        </span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserInfo',

  props: {
    accessToken: {
      type: String,
      required: true
    },
    userInfo: {
      type: Object,
      required: true
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
    }
  }
};
</script>

<style lang="scss" scoped>
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

@media screen and (max-width: 600px) {
  #user-image {
    max-height: 50px !important;
  }
}

@media screen and (max-height: 450px) {
  #user-image {
    max-height: 50px !important;
  }
}
</style>
