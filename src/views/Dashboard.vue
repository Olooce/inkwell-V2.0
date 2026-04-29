<template>
  <div class="dashboard-layout">
    <Navigation :user-name="userName" />

    <main class="dashboard-content">
      <div class="dashboard-grid">
        <router-link to="/writing-tips" class="dashboard-card writing-tips">
          <div class="card-content">
            <h2 class="card-title">Writing tips</h2>
            <img
              src="/assets/images/dashboard/writing-tips.png"
              alt="Writing tips illustration"
              class="card-image"
            />
          </div>
        </router-link>

        <router-link to="/comics" class="dashboard-card comics">
          <div class="card-content">
            <h2 class="card-title">Your Comics</h2>
            <img
              src="/assets/images/dashboard/comic.png"
              alt="Comics illustration"
              class="card-image"
            />
          </div>
        </router-link>

        <router-link to="/create-story" class="dashboard-card create-story">
          <div class="card-content">
            <h2 class="card-title">Create a Story</h2>
            <img
              src="/assets/images/dashboard/create-story.png"
              alt="Create story illustration"
              class="card-image"
            />
          </div>
        </router-link>

        <router-link to="/progress" class="dashboard-card progress">
          <div class="card-content">
            <h2 class="card-title">Progress</h2>
            <img
              src="/assets/images/dashboard/progress.png"
              alt="Progress illustration"
              class="card-image"
            />
          </div>
        </router-link>
      </div>
    </main>

    <!-- Floating Chatbot -->
    <div class="chatbot-container">
      <!-- Chat Toggle Button -->
      <button
        @click="toggleChat"
        class="chat-toggle-btn"
        :class="{ active: isChatOpen }"
        aria-label="Toggle chat"
      >
        <svg
          v-if="!isChatOpen"
          class="chat-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <svg v-else class="chat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" :class="{ open: isChatOpen }">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-header-content">
            <div class="ai-avatar">🤖</div>
            <div class="chat-title">
              <h3>AI Writing Assistant</h3>
              <p class="status" :class="{ online: !isTyping, typing: isTyping }">
                {{ isTyping ? 'AI is thinking...' : 'Online' }}
              </p>
            </div>
          </div>
          <div class="voice-controls">
            <button
              @click="toggleVoiceInput"
              class="voice-btn"
              :class="{ active: isListening, disabled: isTyping }"
              title="Voice input"
            >
              <svg
                v-if="!isListening"
                class="voice-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <svg v-else class="voice-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <button
              @click="speakLastResponse"
              class="voice-btn"
              :disabled="!hasAIResponse || isSpeaking"
              title="Read last response"
            >
              <svg class="speaker-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
                />
              </svg>
            </button>
          </div>
          <button @click="clearChat" class="clear-btn" title="Clear chat">
            <svg class="clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        <!-- Messages Container -->
        <div class="messages-container" ref="messagesContainer">
          <div class="welcome-message" v-if="messages.length === 0">
            <div class="ai-avatar">🤖</div>
            <div class="message-content">
              <p>Hi! I'm your AI writing assistant. I can help you with:</p>
              <ul>
                <li>Writing tips and techniques</li>
                <li>Grammar and spelling corrections</li>
                <li>Story ideas and plot development</li>
                <li>Creative writing exercises</li>
              </ul>
              <p>How can I help you today?</p>
            </div>
          </div>

          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="{ user: message.sender === 'user', ai: message.sender === 'ai' }"
          >
            <div class="message-avatar">
              <span v-if="message.sender === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.text)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="message ai typing-message">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-container">
          <div class="input-wrapper">
            <input
              v-model="currentMessage"
              @keypress.enter="sendMessage"
              @input="handleInput"
              placeholder="Type your message..."
              class="chat-input"
              :disabled="isTyping || isListening"
              ref="chatInput"
            />
            <button
              @click="sendMessage"
              class="send-btn"
              :disabled="!currentMessage.trim() || isTyping || isListening"
            >
              <svg class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <!-- Voice input status -->
          <div v-if="isListening" class="voice-status">
            <div class="pulse-animation"></div>
            <span>Listening... {{ voiceInputText }}</span>
          </div>
          <div class="quick-actions">
            <button
              v-for="action in quickActions"
              :key="action.text"
              @click="sendQuickMessage(action.text)"
              class="quick-action-btn"
              :disabled="isTyping"
            >
              {{ action.text }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed, watch } from 'vue'
import Navigation from '@/components/Navigation.vue'
import { BASE_URL } from '@/services/apiClient.js'

const userName = ref('Arabella')

// Chat state
const isChatOpen = ref(false)
const messages = ref([])
const currentMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
const chatInput = ref(null)

// Voice chat state
const isListening = ref(false)
const isSpeaking = ref(false)
const voiceInputText = ref('')
const synthesis = ref(null)

// Audio recording refs - FIXED: Properly declare these as refs
const mediaRecorder = ref(null)
const audioStream = ref(null)
const audioChunks = ref([])

// Quick action buttons
const quickActions = ref([
  { text: 'Writing tips' },
  { text: 'Grammar help' },
  { text: 'Story ideas' },
  { text: 'Plot development' },
])

// Message ID counter
let messageIdCounter = 0

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    nextTick(() => {
      if (chatInput.value) {
        chatInput.value.focus()
      }
      scrollToBottom()
    })
  }
}

const clearChat = () => {
  messages.value = []
}

const handleInput = () => {
  // Optional: Add typing indicators for user
}

const sendQuickMessage = (message) => {
  currentMessage.value = message
  sendMessage()
}

const streamChatResponse = async (userInput) => {
  try {
    const token = localStorage.getItem('user-token')

    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '',
      },
      body: JSON.stringify({ message: userInput }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let aiMessage = {
      id: messageIdCounter++,
      text: '',
      sender: 'ai',
      timestamp: new Date(),
    }

    messages.value.push(aiMessage)
    isTyping.value = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.trim()) continue

        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data)
            if (parsed.response) {
              const lastMessage = messages.value[messages.value.length - 1]
              if (lastMessage?.sender === 'ai') {
                lastMessage.text += parsed.response
                scrollToBottom()
              }
            }
          } catch (e) {
            console.error('Error parsing JSON:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error)
    throw error
  }
}

const formatMessage = (text) => {
  // Basic markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Check if browser supports Web Speech API
const isSpeechSupported = ref(false)

// Computed property to check if there's an AI response to read
const hasAIResponse = computed(() => {
  return messages.value.some((msg) => msg.sender === 'ai')
})

// Initialize speech recognition
const initSpeechRecognition = () => {
  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia not supported')
      isSpeechSupported.value = false
      return
    }

    isSpeechSupported.value = true
    console.log('Audio recording is supported!')
  } catch (error) {
    console.error('Error checking audio support:', error)
    isSpeechSupported.value = false
  }
}

// Start/stop audio recording (replace toggleVoiceInput)
const toggleVoiceInput = async () => {
  console.log('Toggle voice input clicked')

  if (!isSpeechSupported.value) {
    alert('Audio recording is not supported in this browser')
    return
  }

  if (isTyping.value) {
    console.log('Currently typing, ignoring voice input')
    return
  }

  if (!isListening.value) {
    await startRecording()
  } else {
    await stopRecording()
  }
}

// Initialize speech synthesis
const initSpeechSynthesis = () => {
  if ('speechSynthesis' in window) {
    synthesis.value = window.speechSynthesis
  } else {
    console.warn('Speech synthesis not supported in this browser')
  }
}

const startRecording = async () => {
  try {
    console.log('Starting audio recording...')

    // Request microphone permission
    audioStream.value = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000, // Good for speech recognition
      }
    })

    console.log('Microphone access granted')

    // Clear previous audio chunks
    audioChunks.value = []

    // FIXED: Simplified MediaRecorder options to avoid constructor issues
    const options = {}

    // Try different MIME types in order of preference
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav'
    ]

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        options.mimeType = mimeType
        console.log('Using MIME type:', mimeType)
        break
      }
    }

    // FIXED: Pass the stream as first argument and options as second
    mediaRecorder.value = new MediaRecorder(audioStream.value, options)

    // Handle data available event
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log('Audio chunk received:', event.data.size, 'bytes')
        audioChunks.value.push(event.data)
      }
    }

    // Handle recording stop event
    mediaRecorder.value.onstop = async () => {
      console.log('Recording stopped, processing audio...')
      await processAudioRecording()
    }

    // Handle errors
    mediaRecorder.value.onerror = (event) => {
      console.error('MediaRecorder error:', event.error)
      isListening.value = false
      voiceInputText.value = ''
      alert('Recording error: ' + event.error.message)
    }

    // Start recording
    mediaRecorder.value.start(100) // Collect data every 100ms for better quality
    isListening.value = true
    voiceInputText.value = 'Recording... (Click again to stop)'

  } catch (error) {
    console.error('Error starting recording:', error)
    alert('Failed to access microphone. Please check permissions and try again.')
    isListening.value = false
  }
}

// Stop recording audio
const stopRecording = async () => {
  try {
    console.log('Stopping audio recording...')

    if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
      mediaRecorder.value.stop()
    }

    // Stop all tracks
    if (audioStream.value) {
      audioStream.value.getTracks().forEach(track => track.stop())
      audioStream.value = null
    }

    isListening.value = false
    voiceInputText.value = 'Processing audio...'

  } catch (error) {
    console.error('Error stopping recording:', error)
    isListening.value = false
    voiceInputText.value = ''
  }
}

// Process the recorded audio and send to backend
const processAudioRecording = async () => {
  try {
    if (audioChunks.value.length === 0) {
      console.log('No audio data recorded')
      voiceInputText.value = ''
      return
    }

    // Create blob from recorded chunks
    const audioBlob = new Blob(audioChunks.value, {
      type: mediaRecorder.value.mimeType || 'audio/webm'
    })

    console.log('Audio blob created:', audioBlob.size, 'bytes', 'type:', audioBlob.type)

    // Create FormData to send to backend
    const formData = new FormData()

    // Your Go backend expects the field name to be 'audio', not 'file'
    const filename = `recording_${Date.now()}.${getFileExtension(audioBlob.type)}`
    formData.append('audio', audioBlob, filename)

    // Get auth token
    const token = localStorage.getItem('user-token')

    // Send audio to your Go backend speech-to-text endpoint
    voiceInputText.value = 'Converting speech to text...'

    const response = await fetch(`${BASE_URL}/chat/speech-to-text`, {
      method: 'POST',
      headers: {
        Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '',
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Transcription result:', result)

    // Handle the transcribed text
    if (result.text && result.text.trim()) {
      currentMessage.value = result.text.trim()
      voiceInputText.value = ''
      console.log('Transcribed text:', currentMessage.value)

      // Automatically send the message
      await sendMessage()
    } else {
      console.log('No text transcribed')
      voiceInputText.value = ''
      // Show message to user
      alert('No speech detected or transcription failed. Please try speaking more clearly.')
    }

  } catch (error) {
    console.error('Error processing audio:', error)
    voiceInputText.value = ''

    // More specific error messages
    if (error.message.includes('400')) {
      alert('Invalid audio format. Please try again.')
    } else if (error.message.includes('500')) {
      alert('Speech processing failed on server. Please try again.')
    } else {
      alert('Failed to process audio. Please check your connection and try again.')
    }
  }
}

// Helper function to get file extension from MIME type
const getFileExtension = (mimeType) => {
  switch (mimeType) {
    case 'audio/wav':
      return 'wav'
    case 'audio/webm':
    case 'audio/webm;codecs=opus':
      return 'webm'
    case 'audio/mp4':
      return 'mp4'
    case 'audio/mpeg':
      return 'mp3'
    default:
      return 'webm'
  }
}

// Text-to-speech using backend (replace speakText function)
const speakText = async (text) => {
  if (isSpeaking.value) {
    console.log('Already speaking, ignoring request')
    return
  }

  if (!text || !text.trim()) {
    console.log('No text to speak')
    return
  }

  try {
    isSpeaking.value = true
    console.log('Converting text to speech:', text.substring(0, 100) + '...')

    const token = localStorage.getItem('user-token')

    // Send text to your Go backend text-to-speech endpoint
    const response = await fetch(`${BASE_URL}/chat/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '',
      },
      body: JSON.stringify({ text: text })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Get audio blob from response
    const audioBlob = await response.blob()
    console.log('Audio blob received:', audioBlob.size, 'bytes')

    if (audioBlob.size === 0) {
      throw new Error('Received empty audio file')
    }

    // Create audio URL and play
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)

    audio.onloadeddata = () => {
      console.log('Audio loaded, duration:', audio.duration)
    }

    audio.onended = () => {
      console.log('Audio playback ended')
      isSpeaking.value = false
      URL.revokeObjectURL(audioUrl)
    }

    audio.onerror = (error) => {
      console.error('Audio playback error:', error)
      isSpeaking.value = false
      URL.revokeObjectURL(audioUrl)
      alert('Failed to play audio. The audio file may be corrupted.')
    }

    // Start playback
    await audio.play()

  } catch (error) {
    console.error('Error with text-to-speech:', error)
    isSpeaking.value = false

    // More specific error messages
    if (error.message.includes('400')) {
      alert('Invalid text input for speech synthesis.')
    } else if (error.message.includes('500')) {
      alert('Speech synthesis failed on server. Please try again.')
    } else if (error.name === 'NotAllowedError') {
      alert('Audio playback blocked. Please enable autoplay for this site.')
    } else {
      alert('Failed to convert text to speech. Please try again.')
    }
  }
}

// Speak the last AI response
const speakLastResponse = () => {
  if (!hasAIResponse.value || isSpeaking.value) return

  // Find the last AI message
  const lastAIMessage = [...messages.value].reverse().find((msg) => msg.sender === 'ai')

  if (lastAIMessage) {
    speakText(lastAIMessage.text)
  }
}

// Modify the sendMessage function to optionally speak the response
const sendMessage = async () => {
  if (!currentMessage.value.trim() || isTyping.value || isListening.value) return

  const userMessage = {
    id: messageIdCounter++,
    text: currentMessage.value.trim(),
    sender: 'user',
    timestamp: new Date(),
  }

  messages.value.push(userMessage)
  const userInput = currentMessage.value.trim()
  currentMessage.value = ''

  scrollToBottom()

  // Start typing indicator
  isTyping.value = true

  try {
    // Call the streaming API
    await streamChatResponse(userInput)
  } catch (error) {
    console.error('Error sending message:', error)
    const errorMessage = {
      id: messageIdCounter++,
      text: 'Sorry, I encountered an error. Please try again.',
      sender: 'ai',
      timestamp: new Date(),
    }
    messages.value.push(errorMessage)
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

onMounted(() => {
  // Optional: Load chat history from localStorage
  const savedMessages = localStorage.getItem('chatHistory')
  if (savedMessages) {
    try {
      messages.value = JSON.parse(savedMessages)
      messageIdCounter = messages.value.length
    } catch (e) {
      console.error('Error loading chat history:', e)
    }
  }
  initSpeechRecognition()
  initSpeechSynthesis()
})

// Save messages to localStorage whenever they change
watch(
  messages,
  (newMessages) => {
    localStorage.setItem('chatHistory', JSON.stringify(newMessages))
  },
  { deep: true },
)
</script>

<style scoped>
.dashboard-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.dashboard-content {
  flex: 1;
  padding: 1.5rem;
  margin: 0 auto;
  width: 100%;
  max-width: 1400px;
  height: calc(100vh - 80px);
  margin-top: 80px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
  gap: 1.5rem;
  height: 100%;
}

.dashboard-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-4px);
}

.writing-tips {
  background-color: rgba(6, 143, 255, 0.18);
}

.comics {
  background-color: rgba(255, 147, 6, 0.38);
}

.create-story {
  background-color: rgba(255, 6, 255, 0.18);
}

.progress {
  background-color: rgba(43, 255, 6, 0.29);
}

.card-content {
  position: relative;
  height: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.card-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(1.5rem, 2vw, 2rem);
  color: #000;
  z-index: 1;
}

.card-image {
  position: absolute;
  right: 0;
  bottom: 0;
  height: 75%;
  width: auto;
  object-fit: contain;
}

/* Chatbot Styles */
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
}

.chat-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.chat-toggle-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.chat-icon {
  width: 24px;
  height: 24px;
}

.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 50dvw;
  height: 70dvh;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  transform: scale(0) translateY(20px);
  transform-origin: bottom right;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  opacity: 0;
  pointer-events: none;
}

.chat-window.open {
  transform: scale(1) translateY(0);
  opacity: 1;
  pointer-events: all;
}

.voice-controls {
  display: flex;
  gap: 8px;
  margin: 0 12px;
}

.voice-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.voice-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
  color: #374151;
}

.voice-btn.active {
  background-color: #ef4444;
  color: white;
}

.voice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-icon,
.speaker-icon {
  width: 18px;
  height: 18px;
}

.voice-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #6b7280;
  font-size: 14px;
}

.pulse-animation {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ef4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-header-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  font-size: 24px;
}

.chat-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status {
  margin: 2px 0 0 0;
  font-size: 12px;
  opacity: 0.9;
}

.status.online {
  color: #4ade80;
}

.status.typing {
  color: #fbbf24;
}

.clear-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.clear-icon {
  width: 16px;
  height: 16px;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.welcome-message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.welcome-message .ai-avatar {
  font-size: 20px;
  margin-top: 4px;
}

.welcome-message .message-content {
  flex: 1;
}

.welcome-message p {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
}

.welcome-message ul {
  margin: 12px 0;
  padding-left: 16px;
  color: #6b7280;
  font-size: 13px;
}

.welcome-message li {
  margin-bottom: 4px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: fadeInUp 0.3s ease;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  font-size: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background-color: #f3f4f6;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message.user .message-content {
  text-align: right;
}

.message-text {
  background-color: #f3f4f6;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.ai .message-text {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.typing-message {
  animation: fadeInUp 0.3s ease;
}

.typing-indicator {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 16px 20px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #9ca3af;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input-container {
  padding: 20px;
  border-top: 1px solid #e5e5e5;
  border-radius: 0 0 20px 20px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #667eea;
}

.chat-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-icon {
  width: 18px;
  height: 18px;
}

.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-action-btn {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: white;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #667eea;
  color: #667eea;
}

.quick-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 960px) {
  .dashboard-content {
    padding: 1rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card-content {
    padding: 1rem;
  }

  .card-image {
    height: 65%;
  }

  .chatbot-container {
    bottom: 15px;
    right: 15px;
  }

  .chat-window {
    width: calc(100vw - 30px);
    max-width: 350px;
  }

  .voice-controls {
    margin: 0 8px;
  }

  .voice-btn {
    width: 32px;
    height: 32px;
  }

  .voice-icon,
  .speaker-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-height: 700px) {
  .dashboard-content {
    padding: 1rem;
  }

  .card-content {
    padding: 1rem;
  }

  .card-title {
    font-size: clamp(1.25rem, 1.5vw, 1.5rem);
  }

  .card-image {
    height: 70%;
  }

  .chat-window {
    height: 400px;
  }
}
</style>
