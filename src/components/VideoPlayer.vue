<template>
  <video autoplay="true" ref="video"></video>
</template>

<script>
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { useVideoData } from "stores/video";
// import * as handTrack from "handtrackjs";
import { useQuasar } from "quasar";

export default {
  name: "VideoPlayer",

  setup() {
    const video = ref(null);
    const videoData = useVideoData();
    const $q = useQuasar();
    const canvas = ref(null);
    let context = null;
    let model = null;

    // onBeforeMount(async () => {
    //   const defaultParams = {
    //     flipHorizontal: false,
    //     outputStride: 16,
    //     imageScaleFactor: 1,
    //     maxNumBoxes: 20,
    //     iouThreshold: 0.2,
    //     scoreThreshold: 0.6,
    //     modelType: "ssd320fpnlite",
    //     modelSize: "large",
    //     bboxLineWidth: "2",
    //     fontSize: 17,
    //     height: "100%",
    //   };

    //   model = await handTrack.load(defaultParams);
    // });

    onMounted(() => {
      // context = canvas.value.getContext("2d");
      videoData.setVideo(video);
      videoData.setAvailableVideoDevices();
    });

    // watch(
    //   () => videoData.selectedVideoDevice,
    //   () => {
    //     if (!video.value.srcObject) {
    //       startVideo();
    //       return;
    //     }
    //     handTrack.stopVideo(video.value);
    //     startVideo();
    //   }
    // );

    // const runDetection = () => {
    //   model.detect(video.value).then((predictions) => {
    //     model.renderPredictions(
    //       predictions,
    //       canvas.value,
    //       context,
    //       video.value
    //     );
    //     requestAnimationFrame(runDetection);
    //   });
    // };

    // const startVideo = () => {
    //   handTrack.startVideo(video.value).then((status) => {
    //     if (status) {
    //       $q.notify({
    //         color: "positive",
    //         message: "Video started. Now tracking",
    //       });
    //       runDetection();
    //     }
    //   });
    // };

    return {
      video,
      canvas,
      videoData,
    };
  },
};
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
