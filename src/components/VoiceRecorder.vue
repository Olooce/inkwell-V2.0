<template>
  <div class="voice-recorder">
    <button
      @click="toggleRecording"
      :class="['record-btn', { recording: isRecording }]"
      :disabled="disabled"
    >
      <span v-if="!isRecording">🎤</span>
      <span v-else>⏹️</span>
    </button>
    <div v-if="isRecording" class="recording-status">
      <div class="visualizer">
        <div
          v-for="(bar, index) in visualizerBars"
          :key="index"
          class="bar"
          :style="{ height: bar.height + 'px' }"
        ></div>
      </div>
      <p>Recording... {{ formatTime(elapsedTime) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue'

const props = defineProps({
  disabled: Boolean
})

const emit = defineEmits(['recording-start', 'recording-stop', 'audio-data'])

const isRecording = ref(false)
const mediaRecorder = ref(null)
const audioChunks = ref([])
const elapsedTime = ref(0)
const timer = ref(null)
const audioContext = ref(null)
const analyser = ref(null)
const visualizerBars = ref(Array(12).fill({ height: 2 }))

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioChunks.value = []

    // Set up audio context for visualization
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    analyser.value = audioContext.value.createAnalyser()
    const source = audioContext.value.createMediaStreamSource(stream)
    source.connect(analyser.value)

    mediaRecorder.value = new MediaRecorder(stream)
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
      emit('audio-data', audioBlob)
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.value.start()
    isRecording.value = true
    emit('recording-start')

    // Start timer
    elapsedTime.value = 0
    timer.value = setInterval(() => {
      elapsedTime.value += 1
      updateVisualizer()
    }, 1000)

  } catch (error) {
    console.error('Error starting recording:', error)
    emit('recording-error', error)
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    emit('recording-stop')

    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }

    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
  }
}

const updateVisualizer = () => {
  if (!analyser.value) return

  const dataArray = new Uint8Array(analyser.value.frequencyBinCount)
  analyser.value.getByteFrequencyData(dataArray)

  // Update visualizer bars based on audio data
  visualizerBars.value = visualizerBars.value.map((_, i) => {
    const value = dataArray[i % dataArray.length] / 255
    return { height: 2 + value * 20 }
  })
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  if (isRecording.value) {
    stopRecording()
  }
})
</script>

<style scoped>
.voice-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.record-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.record-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.record-btn.recording {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  animation: pulse 1.5s infinite;
}

.record-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-status {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.visualizer {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 30px;
  gap: 2px;
  margin-bottom: 5px;
}

.bar {
  width: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: height 0.1s ease;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}
</style>
