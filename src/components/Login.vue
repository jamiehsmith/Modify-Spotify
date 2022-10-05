<template>
  <div class="login">
    <div class="login__text">
      <h1>Modify Spotify</h1>
      <h4>
        {{ infoText }}
      </h4>
      <button @click="clickLogin" class="login__button">
        <img class="spotify-logo" src="../assets/spotify_logo.png" />
        <span class="login__button__text">Login with Spotify</span>
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
    clickLogin() {
      window.location = '/login';
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  .login__text {
    display: flex;
    flex-direction: column;
    align-items: center;
    .login__button {
      margin-top: 30px;
      outline: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: auto;
      padding: 20px;
      border-radius: 50px;
      background-color: white;
      color: #04dc5c;
      cursor: pointer;
      border: 1px solid #ccc;
      .spotify-logo {
        height: 25px;
        padding-right: 10px;
      }
      .login__button__text {
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
