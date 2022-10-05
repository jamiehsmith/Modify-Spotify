<template>
  <div id="app">
    <div v-if="isLoggedIn">
      <PlaylistBuilder
        :accessToken="accessToken"
        :userId="userId"
        @unauthorized="resetAccessToken"
      />
    </div>
    <div v-else class="app__login">
      <Login />
    </div>
    <div class="disclaimer">
      Made by
      <a href="http://www.jamieistyping.com" target="_blank">Jamie Smith</a>.
      This website is not affiliated with Spotify.
    </div>
  </div>
</template>

<script>
import Login from './Login.vue';
import PlaylistBuilder from './PlaylistBuilder.vue';

export default {
  name: 'app',

  components: {
    PlaylistBuilder,
    Login,
  },

  data() {
    return {
      accessToken: '',
      refreshToken: '',
      userId: null,
    };
  },

  computed: {
    isLoggedIn() {
      return !!this.accessToken;
    },
  },

  methods: {
    resetAccessToken() {
      if (this.refreshToken) {
        window.location = '/refresh_token';
      } else {
        this.accessToken = '';
      }
    },
  },

  mounted() {
    const cookiesMap = {
      access_token: 'accessToken',
      refresh_token: 'refreshToken',
      user_id: 'userId',
    };

    for (const [key, value] of Object.entries(cookiesMap)) {
      if ($cookies.get(key)) {
        this[value] = $cookies.get(key);
      }
    }
  },
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss">
html,
body {
  height: 100%;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
  height: 100%;
  width: 100%;
  .app__login {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

h1,
h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #04dc5c;
}

.disclaimer {
  position: fixed;
  bottom: 0px;
  width: 100%;
  padding: 10px 0;
  font-size: 12px;
  background: #fff;
}

.swal-modal {
  .swal-title {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-weight: 500;
    font-size: 20px;
  }
  .swal-content,
  .swal-text {
    font-family: Avenir, Helvetica, Arial, sans-serif;
  }

  .swal-text {
    text-align: center;
  }

  .swal-footer {
    display: flex;
    justify-content: center;
  }
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
  .multiselect__single,
  .multiselect__content-wrapper {
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
</style>
