<template>
  <v-card >
    <v-card-title class="title font-weight-light grey white--text">{{ $t('Object members') }}</v-card-title>
    <v-divider></v-divider>
    <v-card-text class="mt-4">
      <v-col>{{ $t('Here you can add or remove some of the members this digital object is composed of.') }}</v-col>
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  name: 'p-m-object-members',
  props: {
    pid: {
      type: String,
      required: true
    }
  },
  computed: {
    instance: function () {
      return this.$store.state.instanceconfig
    }
  },
  data () {
    return {
      loading: false
    }
  }
}
</script>
