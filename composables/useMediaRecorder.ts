import { ref } from '@nuxtjs/composition-api'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

export const useMediaRecorder = () => {
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const chunksRef = ref<Blob[]>([])
  const isProcessing = ref(false)

  const initMediaRecorder = (stream: MediaStream) => {
    isProcessing.value = false

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

    mediaRecorder.value.onstop = async () => {
      const blob = new Blob(chunksRef.value, { type: 'video/webm' })
      chunksRef.value = []

      const ffmpeg = createFFmpeg({
        log: true,
        corePath: 'js/ffmpeg-core.js',
        progress: ({ ratio }) => {
          // 現状 NaN が帰ってくる...
          // progress.value = ratio
          isProcessing.value = ratio !== 1
        },
      })

      await ffmpeg.load()

      const name = 'record.webm'
      const outName = 'out.mp4'
      ffmpeg.FS('writeFile', name, await fetchFile(blob))
      await ffmpeg.run('-i', name, outName)
      const data = ffmpeg.FS('readFile', outName)
      const videoURL = window.URL.createObjectURL(
        new Blob([data.buffer], { type: 'video/mp4' }),
      )
      const downLoadLink = document.createElement('a')
      downLoadLink.href = videoURL
      downLoadLink.download = outName
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

  return {
    initMediaRecorder,
    mediaRecorder,
    isProcessing,
    startRecord,
    stopRecord,
  }
}
