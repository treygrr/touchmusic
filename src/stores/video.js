import { defineStore } from "pinia";

export const useVideoData = defineStore("videoData", {
  state: () => ({
    video: null,
    availableVideoDevices: [],
    selectedVideoDevice: null,
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

    setSelectedVideoDevice(value) {
      this.selectedVideoDevice = value;
      this.setCamStreamFromSelection(value);
    },

    async setCamStreamFromSelection(selection) {
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              deviceId: selection.value,
            },
          })
          .then((stream) => {
            this.video.srcObject = stream;
            console.log(stream.id);
          })
          .catch(function (error) {});
      }
    },
  },
});
