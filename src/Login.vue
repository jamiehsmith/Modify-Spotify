<template>
  <div id="login">
    <div id="login-text">
      <h1>Modify Spotify</h1>
      <h4>
        {{ infoText }}
      </h4>
      <button v-on:click="clickLogin()" id="login-button">
        <img id="spotify-logo" src="./assets/spotify_logo.png" />
        <span id="login-button-text">Login with Spotify</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',

  data() {
    return {
      infoText:
        "View your top artists and tracks, and make playlists utilizing Spotify's recommendation engine.",
    };
  },

  methods: {
    clickLogin: function () {
      window.location = '/login';
    },
  },
};
</script>

<style lang="scss">
#login {
  #login-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    #login-button {
      margin-top: 30px;
      outline: none;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: auto;
      padding: 20px;
      border-radius: 50px;
      background-color: white;
      color: #04dc5c;
      cursor: pointer;
      border: 1px solid #ccc;
      #spotify-logo {
        height: 25px;
        padding-right: 10px;
      }
      #login-button-text {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

html::-webkit-scrollbar {
  display: none;
}
</style>
