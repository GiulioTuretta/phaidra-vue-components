<template>
  <v-row >
    <v-col cols="8">
      <v-text-field
        :value="value"
        :label="$t('Filename')"
        readonly
        :filled="inputStyle==='filled'"
        :outlined="inputStyle==='outlined'"
      ></v-text-field>
    </v-col>
  </v-row>
</template>
<script>
import { fieldproperties } from '../../mixins/fieldproperties'

export default {
  name: 'p-i-filename-readonly',
  mixins: [fieldproperties],
  props: {
    value: {
      type: String
    },
    label: {
      type: String,
      required: true
    }
  }
}
</script>
