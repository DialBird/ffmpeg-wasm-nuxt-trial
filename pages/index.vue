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
        @click="startRecord"
      >
        Start Recording
      </button>
      <button
        class="
          bg-red-500
          hover:bg-red-700
          text-white
          font-bold
          py-2
          px-4
          mt-4
          rounded
        "
        @click="stopRecord"
      >
        Stop Recording
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'
import { useMediaRecorder } from '@/composables/useMediaRecorder'

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const localStream = ref<MediaStream | null>(null)
    const videoRef = ref<HTMLMediaElement>(null!)
    const { initMediaRecorder, mediaRecorder, startRecord, stopRecord } =
      useMediaRecorder()

    if (process.client) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream) => {
          localStream.value = stream
          videoRef.value.srcObject = stream

          initMediaRecorder(stream)
        })
    }

    return {
      mediaRecorder,
      startRecord,
      stopRecord,
      videoRef,
    }
  },
})
</script>

<style lang="scss" scoped>
</style>
