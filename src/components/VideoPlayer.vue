<template>
  <video
    autoplay="true"
    ref="video"
    @playing="playingStream = true"
    @emptied="playingStream = false"
  ></video>
  <canvas ref="canvas"></canvas>
</template>

<script>
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { useVideoData } from "stores/video";
import { useQuasar } from "quasar";

import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import { drawHand } from "../utilities";
import * as fp from "fingerpose";

export default {
  name: "VideoPlayer",

  setup() {
    const video = ref(null);
    const videoData = useVideoData();
    const q = useQuasar();
    const canvas = ref(null);
    let context = null;
    const playingStream = ref(false);

    onBeforeMount(async () => {});

    onMounted(async () => {
      videoData.setVideo(video);
      videoData.setAvailableVideoDevices();
    });

    const videoStartLogic = async () => {
      const net = await handpose.load();
      console.log("Handpose model loaded.");
      //  Loop and detect hands
      setInterval(() => {
        detect(net);
      }, 10);
    };

    const detect = async (net) => {
      // Check data is available
      if (
        typeof video.value !== "undefined" &&
        video.value !== null &&
        video.value.readyState === 4
      ) {
        // Get Video Properties
        const videoFeed = video.value;
        const videoWidth = video.value.getBoundingClientRect().width;
        const videoHeight = video.value.getBoundingClientRect().height;

        // Set video width
        video.value.width = videoWidth;
        video.value.height = videoHeight;

        // Set canvas height and width
        canvas.value.width = videoWidth;
        canvas.value.height = videoHeight;

        // Make Detections
        const hand = await net.estimateHands(videoFeed);
        // console.log(hand);

        ///////// NEW STUFF ADDED GESTURE HANDLING

        if (hand.length > 0) {
          const GE = new fp.GestureEstimator([
            fp.Gestures.VictoryGesture,
            fp.Gestures.ThumbsUpGesture,
          ]);
          const gesture = await GE.estimate(hand[0].landmarks, 4);
          if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
            // console.log(gesture.gestures);

            const confidence = gesture.gestures.map(
              (prediction) => prediction.score
            );
            const maxConfidence = confidence.indexOf(
              Math.max.apply(null, confidence)
            );
            console.log(gesture.gestures[maxConfidence].name);
            // console.log(gesture);
          }
        }
        ///////// NEW STUFF ADDED GESTURE HANDLING

        // Draw mesh
        context = canvas.value.getContext("2d");
        drawHand(
          hand,
          context,
          video.value.videoWidth,
          video.value.videoHeight
        );
      }
    };

    watch(
      () => playingStream.value,
      async (newValue, oldValue) => {
        if (newValue === true) {
          videoStartLogic();
        }
      }
    );

    return {
      video,
      canvas,
      q,
      playingStream,
      videoData,
    };
  },
};
</script>

<style lang="scss" scoped>
video {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
}
</style>
