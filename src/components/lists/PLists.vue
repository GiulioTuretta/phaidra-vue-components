<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="title font-weight-light grey white--text">
            {{ $t('Manage object lists') }}
          </v-card-title>
          <v-card-text>
            <v-data-table
              hide-default-header
              :headers="listsHeaders"
              :items="lists"
              :search="listsSearch"
              :loading="listsLoading"
              :loading-text="$t('Loading object lists...')"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-text-field
                    v-model="listsSearch"
                    append-icon="search"
                    :label="$t('Search...')"
                    single-line
                    hide-details
                  ></v-text-field>
                  <v-spacer></v-spacer>
                  <v-dialog v-model="createDialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" dark class="mb-2" v-on="on">{{ $t('New list') }}</v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="title font-weight-light grey white--text">
                        {{ $t('Create new object list') }}
                      </v-card-title>
                      <v-card-text>
                        <v-text-field
                          v-model="newListName"
                          :label="$t('Enter object list name...')"
                          single-line
                          hide-details
                        ></v-text-field>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn dark @click="createDialog = false" color="grey">{{ $t('Cancel') }}</v-btn>
                        <v-btn @click="createList()" color="primary">{{ $t('Create') }}</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-toolbar>
              </template>
              <template v-slot:item.name="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <span v-on="on">{{ item.name }}</span>
                  </template>
                  <span>{{ item.listid }}</span>
                </v-tooltip>
              </template>
              <template v-slot:item.created="{ item }">
                {{ item.created | unixtime }}
              </template>
              <template v-slot:item.updated="{ item }">
                {{ item.updated | unixtime }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" class="mx-3" @click="loadedList = item">edit</v-icon>
                <v-icon color="grey" class="mx-3" @click="deleteListDialog(item)">delete</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row no-gutters v-if="loadedList">
      <v-col cols="12">
        <v-card>
          <v-card-title class="title font-weight-light grey white--text">
            {{ loadedList.name }}
          </v-card-title>
          <v-card-text>
            <v-data-table
              hide-default-header
              :headers="membersHeaders"
              :items="members"
              :search="membersSearch"
              :loading="membersLoading"
              :loading-text="$t('Loading object list members...')"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-text-field
                    v-model="membersSearch"
                    append-icon="search"
                    :label="$t('Search...')"
                    single-line
                    hide-details
                  ></v-text-field>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" dark class="mb-2"  @click="$refs.collectiondialog.open()">{{ $t('Add to collection') }}</v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item.pid="{ item }">
                <router-link :to="{ name: 'detail', params: { pid: item.pid } }">{{ item.pid }}</router-link>
              </template>
              <template v-slot:item.title="{ item }">
                {{ item.title | truncate(100) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="grey" class="mx-3" @click="removeMember(item)">delete</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="deleteDialog" max-width="500px" v-if="listToDelete">
      <v-card>
        <v-card-title class="title font-weight-light grey white--text">
          {{ $t('Delete object list') }}
        </v-card-title>
        <v-card-text>
          <p class="mt-6 title font-weight-light grey--text text--darken-3">{{ $t('Delete object list') + listToDelete.name + '?' }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn dark @click="createDialog = false" color="grey">{{ $t('Cancel') }}</v-btn>
          <v-btn @click="deleteList()" color="primary">{{ $t('Delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <collection-dialog ref="collectiondialog" @collection-selected="addToCollection($event)"></collection-dialog>
  </v-container>
</template>

<script>
import CollectionDialog from '../select/CollectionDialog'

export default {
  name: 'p-lists',
  components: {
    CollectionDialog
  },
  computed: {
    instance: function () {
      return this.$store.state.instanceconfig
    }
  },
  watch: {
    loadedList: async function () {
      if (this.loadedList) {
        this.membersLoading = true
        try {
          let response = await this.$http.request({
            method: 'GET',
            url: this.instance.api + '/list/' + this.loadedList.listid,
            headers: {
              'X-XSRF-TOKEN': this.$store.state.user.token
            }
          })
          if (response.status === 200) {
            this.members = response.data.list.members
          } else {
            if (response.data.alerts && response.data.alerts.length > 0) {
              this.$store.commit('setAlerts', response.data.alerts)
            }
          }
        } catch (error) {
          console.log(error)
        } finally {
          this.membersLoading = false
        }
      }
    }
  },
  data () {
    return {
      createDialog: false,
      deleteDialog: false,
      addToDialog: false,
      listToDelete: null,
      listToAddToCollection: null,
      newListName: '',
      listsLoading: false,
      listsSearch: '',
      deleteListConfirm: false,
      listsHeaders: [
        { text: 'Name', align: 'left', value: 'name' },
        { text: 'Created', align: 'right', value: 'created' },
        { text: 'Updated', align: 'right', value: 'updated' },
        { text: 'Actions', align: 'right', value: 'actions', sortable: false }
      ],
      lists: [],
      loadedList: null,
      membersLoading: false,
      membersSearch: '',
      deleteMembersConfirm: false,
      membersHeaders: [
        { text: 'PID', align: 'left', value: 'pid' },
        { text: 'Title', align: 'left', value: 'title' },
        { text: 'Actions', align: 'right', value: 'actions', sortable: false }
      ],
      members: []
    }
  },
  methods: {
    addToCollection: async function (collection) {
      try {
        var httpFormData = new FormData()
        httpFormData.append('metadata', JSON.stringify({ metadata: { members: this.members } }))
        let response = await this.$http.request({
          method: 'POST',
          url: this.instance.api + '/collection/' + collection.pid + '/members/add',
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-XSRF-TOKEN': this.$store.state.user.token
          },
          data: httpFormData
        })
        if (response.data.status === 200) {
          this.$store.commit('setAlerts', [ { msg: this.$t('Collection successfuly updated'), type: 'success' } ])
          this.$router.push({ name: 'detail', params: { pid: collection.pid } })
        } else {
          if (response.data.alerts && response.data.alerts.length > 0) {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }
      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.loading = false
      }
    },
    deleteListDialog: function (list) {
      this.listToDelete = list
      this.deleteDialog = true
    },
    addToCollectionDialog: function (list) {
      this.listToAddToCollection = list
      this.addToDialog = true
    },
    createList: async function () {
      try {
        this.createDialog = false
        this.listsLoading = true
        var httpFormData = new FormData()
        httpFormData.append('name', this.newListName)
        let response = await this.$http.request({
          method: 'POST',
          url: this.instance.api + '/list/add',
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-XSRF-TOKEN': this.$store.state.user.token
          },
          data: httpFormData
        })
        if (response.data.status === 200) {
          this.newListName = ''
        } else {
          if (response.data.alerts && response.data.alerts.length > 0) {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }
        response = await this.$http.request({
          method: 'GET',
          url: this.instance.api + '/lists',
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.data.status === 200) {
          this.lists = response.data.lists
        }
      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.listsLoading = false
      }
    },
    deleteList: async function () {
      this.deleteDialog = false
      this.listsLoading = true
      try {
        let response = await this.$http.request({
          method: 'POST',
          url: this.instance.api + '/list/' + this.listToDelete.listid + '/remove',
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.data.status !== 200) {
          if (response.data.alerts && response.data.alerts.length > 0) {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }
        response = await this.$http.request({
          method: 'GET',
          url: this.instance.api + '/lists',
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.data.status === 200) {
          this.lists = response.data.lists
        }
      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.listsLoading = false
        this.listToDelete = null
      }
    },
    removeMember: async function (member) {
      try {
        this.membersLoading = true
        var httpFormData = new FormData()
        httpFormData.append('members', JSON.stringify({ members: [ member ] }))
        let response = await this.$http.request({
          method: 'POST',
          url: this.instance.api + '/list/' + this.loadedList.listid + '/members/remove',
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.data.status !== 200) {
          if (response.data.alerts && response.data.alerts.length > 0) {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }
        response = await this.$http.request({
          method: 'GET',
          url: this.instance.api + '/list/' + this.loadedList.listid,
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.data.status === 200) {
          this.members = response.data.list.members
        }
      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.membersLoading = false
      }
    }
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async vm => {
      vm.listsLoading = true
      try {
        let response = await vm.$http.request({
          method: 'GET',
          url: vm.instance.api + '/lists',
          headers: {
            'X-XSRF-TOKEN': vm.$store.state.user.token
          }
        })
        if (response.data.status === 200) {
          vm.lists = response.data.lists
        } else {
          if (response.data.alerts && response.data.alerts.length > 0) {
            vm.$store.commit('setAlerts', response.data.alerts)
          }
        }
      } catch (error) {
        console.log(error)
        vm.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        vm.listsLoading = false
      }
    })
  }
}
</script>
