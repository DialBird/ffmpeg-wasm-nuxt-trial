<template>
  <div class="bg-gray-200 w-full h-screen pt-24">
    <div class="container mx-auto bg-white p-8">
      <video
        ref="videoRef"
        width="450"
        height="300"
        class="rounded-md"
        autoplay
        muted
      />
      <button
        class="
          bg-blue-500
          hover:bg-blue-700
          text-white
          font-bold
          py-2
          px-4
          mt-4
          rounded
        "
      >
        Start Recording
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const stream = ref<MediaStream | null>(null)
    const mediaRecorder = ref<MediaRecorder | null>(null)
    const videoRef = ref<HTMLMediaElement>(null!)

    if (process.client) {
      let options: MediaRecorderOptions
      if (MediaRecorder.isTypeSupported('video/webm;codecs="vp9,opus"')) {
        options = { mimeType: 'video/webm;codecs="vp9,opus"' }
      } else {
        options = { mimeType: 'video/webm;codecs="vp8,opus"' }
      }

      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((s) => {
          stream.value = s
          videoRef.value.srcObject = stream.value
          // mediaRecorder.value = new MediaRecorder(stream.value, options)
        })
    }

    return { mediaRecorder, stream, videoRef }
  },
})
</script>

<style lang="scss" scoped>
</style>
