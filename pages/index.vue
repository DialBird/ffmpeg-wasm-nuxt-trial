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
        @click="onClickRecord"
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
        @click="onClickStop"
      >
        Stop Recording
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const localStream = ref<MediaStream | null>(null)
    const mediaRecorder = ref<MediaRecorder | null>(null)
    const videoRef = ref<HTMLMediaElement>(null!)
    const chunksRef = ref<Blob[]>([])

    if (process.client) {
      let options: MediaRecorderOptions
      if (MediaRecorder.isTypeSupported('video/webm;codecs="vp9,opus"')) {
        options = { mimeType: 'video/webm;codecs="vp9,opus"' }
      } else {
        options = { mimeType: 'video/webm;codecs="vp8,opus"' }
      }

      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream) => {
          localStream.value = stream
          videoRef.value.srcObject = stream

          mediaRecorder.value = new MediaRecorder(stream, options)

          mediaRecorder.value.ondataavailable = (e: BlobEvent) => {
            if (e.data && e.data.size > 0) {
              chunksRef.value = [...chunksRef.value, e.data]
            }
          }

          mediaRecorder.value.onstop = () => {
            const blob = new Blob(chunksRef.value, { type: 'video/webm' })
            chunksRef.value = []

            // その場で自動ダウンロードする
            const videoURL = window.URL.createObjectURL(blob)
            const downLoadLink = document.createElement('a')
            downLoadLink.href = videoURL
            downLoadLink.download = 'record.webm'
            downLoadLink.click()
            downLoadLink.remove()

            if (stream.active) {
              stream.getTracks().forEach((track) => track.stop())
            }
          }
        })
    }

    const onClickRecord = () => {
      if (!mediaRecorder.value || mediaRecorder.value.state !== 'inactive')
        return

      mediaRecorder.value.start(10)
    }

    const onClickStop = () => {
      if (!mediaRecorder.value || mediaRecorder.value.state !== 'recording')
        return

      mediaRecorder.value.stop()
    }

    return {
      mediaRecorder,
      onClickRecord,
      onClickStop,
      videoRef,
    }
  },
})
</script>

<style lang="scss" scoped>
</style>
