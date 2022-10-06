<template>
  <div class="user-info">
    <img class="user__image" :v-if="userImage" :src="userImage" />
    <div class="user-info__text">
      <span class="user-name" :v-if="userInfo.display_name">
        {{ userInfo.display_name }}
      </span>
      <span class="user-info__row">
        <span :v-if="userFollowers"> Followers: {{ userFollowers }} </span>
        <span class="user-info__separator" :v-if="userFollowers && userProfileUrl">
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
    userInfo: {
      type: Object,
      required: true,
    },
  },

  computed: {
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
};
</script>

<style lang="scss" scoped>
.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: auto;
  padding: 5px;
  justify-content: center;
  .user-info__text {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px;
  }
  .user__image {
    padding: 5px;
    max-height: 100px;
    height: 100px;
    max-width: 100px;
    width: 100px;
    border-radius: 50%;
  }
  .user-name {
    font-size: 16px;
  }
  .user-info__row {
    display: flex;
    align-items: center;
    font-size: 12px;
    white-space: nowrap;
    .user-info__separator {
      font-size: 20px;
      padding: 4px;
    }
  }
}

@media screen and (max-width: 600px) {
  .user__image {
    max-height: 50px !important;
    max-width: 50px !important;
  }
}

@media screen and (max-height: 450px) {
  .user__image {
    max-height: 50px !important;
    max-width: 50px !important;
  }
}
</style>
