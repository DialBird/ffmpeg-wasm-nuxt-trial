import { ref } from '@nuxtjs/composition-api'

export const useMediaRecorder = () => {
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const chunksRef = ref<Blob[]>([])

  const initMediaRecorder = (stream: MediaStream) => {
    let options: MediaRecorderOptions
    if (MediaRecorder.isTypeSupported('video/webm;codecs="vp9,opus"')) {
      options = { mimeType: 'video/webm;codecs="vp9,opus"' }
    } else {
      options = { mimeType: 'video/webm;codecs="vp8,opus"' }
    }

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
  }

  const startRecord = () => {
    if (!mediaRecorder.value || mediaRecorder.value.state !== 'inactive') return

    mediaRecorder.value.start(10)
  }

  const stopRecord = () => {
    if (!mediaRecorder.value || mediaRecorder.value.state !== 'recording')
      return

    mediaRecorder.value.stop()
  }

  return { initMediaRecorder, mediaRecorder, startRecord, stopRecord }
}
