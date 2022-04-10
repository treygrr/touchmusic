<template>
  <q-page class="flex flex-center">
    <VideoPlayer />
  </q-page>
</template>

<script>
import { onMounted, ref } from "vue";
import { useVideoData } from "stores/video";
import VideoPlayer from "../components/VideoPlayer.vue";

export default {
  name: "IndexPage",
  setup() {
    const videoData = useVideoData();
    return {
      videoData,
    };
  },
  components: { VideoPlayer },
};
</script>
