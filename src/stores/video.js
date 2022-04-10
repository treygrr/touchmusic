import { defineStore } from "pinia";

export const useVideoData = defineStore("videoData", {
  state: () => ({
    video: null,
    availableVideoDevices: [],
    selectedVideoDevice: null,
    videoReady: false,
  }),

  actions: {
    setVideo(value) {
      console.log("value", value);
      this.video = value.value;
    },
    async setAvailableVideoDevices() {
      if (navigator.mediaDevices.getUserMedia) {
        // allow user to select what camera device they want
        // console log the devices the user has for webcams
        const ready = await navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            devices.forEach((device) => {
              if (device.kind === "videoinput") {
                this.availableVideoDevices.push({
                  label: device.label,
                  value: device.deviceId,
                });
              }
            });
            if (!this.selectedVideoDevice) {
              // if no device is selected push the first available device
              this.setSelectedVideoDevice(this.availableVideoDevices[0]);
            }
          })
          .catch(function (err) {
            console.log(err.name + ": " + err.message);
          });
        return ready;
      }
    },

    async setSelectedVideoDevice(value) {
      this.selectedVideoDevice = value;
      try {
        await this.setCamStreamFromSelection(value);
      } catch (error) {
        console.log(error);
      }
    },

    stopTracks() {
      this.video.srcObject?.getTracks().forEach((track) => {
        track.stop();
      });
      this.video.srcObject = null;
      this.videoReady = false;
    },

    async setCamStreamFromSelection(selection) {
      this.stopTracks();
      if (navigator.mediaDevices.getUserMedia) {
        const setStream = navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selection.value,
          },
        });
        try {
          this.video.srcObject = await setStream;
          this.videoReady = true;
          console.log();
        } catch (err) {
          console.log(err.name + ": " + err.message);
        }
      }
    },
  },
});
