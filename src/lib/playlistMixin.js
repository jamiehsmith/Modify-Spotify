export default {
  data() {
    return {
      maxOptions: 5,
    };
  },
  computed: {
    maxOptionsSelected() {
      return this.selected.length >= this.maxOptions;
    },
  },
};
