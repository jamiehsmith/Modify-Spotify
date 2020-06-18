<template>
  <div id="app">
    <img src="./assets/favicon.png" :style="{ height: '1px', width: '1px', display: 'none' }">
    <div v-if="isLoggedIn">
      <PlaylistBuilder
        :accessToken="accessToken"
        :userId="userId"
        @unauthorized="resetAccessToken"
      />
    </div>
    <div v-else id="app-login">
      <Login/>
    </div>
    <div id="disclaimer">
      Made by Jamie Smith - <a href="http://www.jamieistyping.com" target="_blank">www.jamieistyping.com</a>. This website is not affiliated with Spotify.
    </div> 
  </div>
</template>

<script>
import Login from './Login.vue'
import PlaylistBuilder from './PlaylistBuilder.vue'
import VueCookies from 'vue-cookies'

export default {
  name: 'app',

  components: {
    PlaylistBuilder,
    Login,
  },

  data () {
    return {
      accessToken: '',
      refreshToken: '',
      userId: null,
    }
  },

  computed: {
    isLoggedIn() {
      return this.accessToken.length ? true : false;
    }
  },

  methods: {
    resetAccessToken: function() {
      if (this.refreshToken) {
        window.location = "/refresh_token";
      } else {
        this.accessToken = '';
      }
    }
  },

  mounted() {
    if (VueCookies.get('access_token')) {
      this.accessToken = VueCookies.get('access_token');
    }

    if (VueCookies.get('refresh_token')) {
      this.refreshToken = VueCookies.get('refresh_token');
    }

    if (VueCookies.get('user_id')) {
      this.userId = VueCookies.get('user_id');
    }
  }
}
</script>

<style lang="scss">
html, body {
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
  #app-login {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

h1, h2 {
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

  #disclaimer {
    position: fixed;
    bottom: 0px;
    width: 100%;
    padding: 10px 0;
    font-size: 12px;
    background: #fff;
  }
</style>
