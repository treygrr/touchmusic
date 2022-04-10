<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="settings"
          aria-label="Settings"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> touchplayer </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label class="text-h5 text-center q-mt-md">
          Settings
        </q-item-label>
        <q-item-label header>
          <q-select
            label="Select an Input Camera"
            rounded
            dense
            outlined
            :options="videoData.availableVideoDevices"
            v-model="videoSelection"
        /></q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { useVideoData } from "stores/video";
import { computed } from "@vue/reactivity";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const leftDrawerOpen = ref(false);
    const videoData = useVideoData();

    const videoSelection = computed({
      get() {
        return videoData.selectedVideoDevice;
      },
      set(value) {
        videoData.setSelectedVideoDevice(value);
      },
    });

    return {
      leftDrawerOpen,
      videoSelection,
      videoData,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
