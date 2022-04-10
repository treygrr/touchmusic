<template>
  <div style="position: relative">
    <div
      style="
        overflow: hidden;
        height: 0;
        width: 0;
        position: absolute;
        top: 0;
        left: 0;
      "
    >
      <video
        autoplay="true"
        ref="video"
        @playing="playingStream = true"
        @emptied="playingStream = false"
        width="1920"
        height="1080"
      ></video>
    </div>
    <div
      ref="virtualCursor"
      :style="
        `
        width: 10px;
        height: 10px;
        border: 1px solid red;
        border-radius: 100%;
        position: absolute;` +
        `top: ${centerY}px;
        left: ${centerX}px;
        background-color: ${cursorState === 'moving' ? 'red' : 'blue'};`
      "
    ></div>
    <canvas ref="canvas" style="user-select: none"></canvas>
    <q-btn
      style="position: absolute; right: 500px; top: 400px; z-index: 100"
      @click="q.notify('Hello from the button')"
    >
      Some button my dude
      <q-icon name="play"></q-icon>
    </q-btn>
  </div>
</template>

<script>
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { useVideoData } from "stores/video";
import * as handTrack from "handtrackjs";
import { useQuasar } from "quasar";

export default {
  name: "VideoPlayer",

  setup() {
    const video = ref(null);
    const videoData = useVideoData();
    const q = useQuasar();
    const canvas = ref(null);
    let context = null;
    let model = null;
    const playingStream = ref(false);
    const virtualCursor = ref(null);
    const centerX = ref(0);
    const centerY = ref(0);
    const cursorState = ref("moving");
    const defaultParams = {
      flipHorizontal: false,
      outputStride: 16,
      imageScaleFactor: 1,
      maxNumBoxes: 2,
      iouThreshold: 0.2,
      scoreThreshold: 0.6,
      modelType: "ssd640fpnlite",
      modelSize: "small",
      bboxLineWidth: "2",
      fontSize: 17,
    };

    onBeforeMount(async () => {});

    onMounted(async () => {
      context = canvas.value.getContext("2d");
      videoData.setVideo(video);
      videoData.setAvailableVideoDevices();
      startVideo();
    });

    watch(
      () => playingStream.value,
      async (boolean) => {
        if (model) {
          model.dispose();
        }
        model = await handTrack.load(defaultParams);
        console.log("Playing stream called", boolean);
        if (boolean) {
          startVideo();
        }
      }
    );

    const runDetection = () => {
      if (!playingStream.value) {
        console.log("Stream is not playing so we stop here.");
        return;
      }
      model
        .detect(video.value)
        .then((predictions) => {
          model.renderPredictions(
            predictions,
            canvas.value,
            context,
            video.value
          );
          checkForCommands(predictions);
          // console.log(video.value.width, video.value.height);
          requestAnimationFrame(runDetection);
        })
        .catch((err) => {
          console.log("Error in runDetection", err);
        });
    };

    const checkForCommands = (predictions) => {
      const hasCommands = predictions.some((prediction) => {
        return prediction.label === "open" || prediction.label === "closed";
      });

      const closedPredictions = predictions.filter((prediction) => {
        return prediction.label === "closed";
      })[0];

      // we only care about first result of open
      if (closedPredictions) {
        cursorState.value = "closed";
        // convert bounding box to coordinates to x y width height
        const x = closedPredictions.bbox[0];
        const y = closedPredictions.bbox[1];
        const width = closedPredictions.bbox[2];
        const height = closedPredictions.bbox[3];
        // get center of bounding box
        centerX.value = x + width / 2;
        centerY.value = y + height / 2;
        debounce(virtualClick(), 1000);
        return;
      }

      // get predictions that are open
      const openPredictions = predictions.filter((prediction) => {
        return prediction.label === "open";
      })[0];

      if (openPredictions) {
        cursorState.value = "moving";
        // convert bounding box to coordinates to x y width height
        const x = openPredictions.bbox[0];
        const y = openPredictions.bbox[1];
        const width = openPredictions.bbox[2];
        const height = openPredictions.bbox[3];
        // get center of bounding box
        centerX.value = x + width / 2;
        centerY.value = y + height / 2;
        virtualMove();
      }
    };

    const virtualClick = () => {
      // click but debounce to 1000 ms then
      // send a click event the to the element the virtualCursor is on
      const target = document.elementFromPoint(centerX.value, centerY.value);

      target.click();
      console.log("clicked", target);
    };

    const virtualMove = () => {
      // move the virtual cursor to the center of the bounding box
      const target = document.elementFromPoint(centerX.value, centerY.value);
      // send target hover event
      target.dispatchEvent(new Event("mouseenter"));
      console.log("moved");
    };

    const debounce = (func, wait, immediate) => {
      let timeout;
      return function () {
        const context = this,
          args = arguments;
        const later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    const startVideo = async () => {
      runDetection();
    };

    return {
      video,
      canvas,
      virtualCursor,
      q,
      defaultParams,
      model,
      playingStream,
      startVideo,
      centerX,
      cursorState,
      centerY,
      videoData,
    };
  },
};
</script>
