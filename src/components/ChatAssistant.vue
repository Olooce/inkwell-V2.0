<template>
  <div class="chat-root no-print">
    <button
      ref="toggleButton"
      type="button"
      class="chat-fab"
      :class="{ open: isOpen }"
      :aria-expanded="isOpen"
      aria-controls="chat-panel"
      @click="isOpen ? close() : open()"
    >
      <component :is="isOpen ? X : MessageCircle" :size="26" />
      <span class="fab-label">{{ isOpen ? 'Close' : 'Ask the writing helper' }}</span>
    </button>

    <section
      v-show="isOpen"
      id="chat-panel"
      class="chat-panel"
      role="dialog"
      aria-labelledby="chat-title"
    >
      <header class="chat-header">
        <div>
          <h2 id="chat-title">Writing helper</h2>
          <p class="chat-sub">Ask about grammar, ideas, or how to improve a sentence.</p>
        </div>
        <div class="header-actions">
          <button
            v-if="messages.length"
            type="button"
            class="icon-btn"
            aria-label="Start a new chat"
            title="Start a new chat"
            @click="confirmClear = true"
          >
            <Trash2 :size="20" />
          </button>
          <button type="button" class="icon-btn" aria-label="Close chat" @click="close">
            <X :size="20" />
          </button>
        </div>
      </header>

      <div
        ref="scroller"
        class="messages"
        role="log"
        aria-live="polite"
        :aria-busy="isStreaming"
        aria-label="Conversation"
      >
        <div v-if="!messages.length" class="welcome">
          <p><strong>Hi {{ userStore.displayName.value }}! 👋</strong></p>
          <p>I can help you write. Try one of these, or type your own question:</p>
          <div class="suggestions">
            <button
              v-for="s in suggestions"
              :key="s"
              type="button"
              class="suggestion"
              @click="send(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <div v-for="m in messages" :key="m.id" class="msg" :class="m.role">
          <span class="sr-only">{{ m.role === 'user' ? 'You said:' : 'Helper said:' }}</span>
          <div class="bubble">
            <div v-if="m.content" class="text" v-html="format(m.content)"></div>
            <div v-else class="typing" aria-label="Helper is typing">
              <span></span><span></span><span></span>
            </div>
            <div v-if="m.error" class="msg-error">
              <CircleAlert :size="16" /> {{ m.error }}
              <button type="button" class="link-btn" @click="retry(m)">Try again</button>
            </div>
          </div>
          <div v-if="m.role === 'assistant' && m.content && !m.streaming" class="msg-tools">
            <button
              type="button"
              class="tool-btn"
              :aria-pressed="speakingId === m.id"
              :disabled="loadingSpeechId === m.id"
              @click="toggleSpeak(m)"
            >
              <component :is="speakingId === m.id ? CircleStop : Volume2" :size="16" />
              {{
                loadingSpeechId === m.id
                  ? 'Loading…'
                  : speakingId === m.id
                    ? 'Stop reading'
                    : 'Read aloud'
              }}
            </button>
          </div>
        </div>
      </div>

      <footer class="composer">
        <p v-if="recordingState !== 'idle'" class="voice-status" role="status">
          <span v-if="recordingState === 'recording'" class="rec-dot" aria-hidden="true"></span>
          {{
            recordingState === 'recording'
              ? `Listening… ${recordSeconds}s - press stop when you’re done`
              : 'Turning your speech into text…'
          }}
        </p>
        <form class="composer-row" @submit.prevent="send()">
          <button
            type="button"
            class="icon-btn mic"
            :class="{ recording: recordingState === 'recording' }"
            :aria-label="recordingState === 'recording' ? 'Stop recording' : 'Speak your message'"
            :disabled="isStreaming || recordingState === 'transcribing'"
            @click="toggleRecording"
          >
            <component :is="recordingState === 'recording' ? CircleStop : Mic" :size="20" />
          </button>
          <label for="chat-input" class="sr-only">Message</label>
          <textarea
            id="chat-input"
            ref="input"
            v-model="draft"
            rows="1"
            placeholder="Type your message…"
            :disabled="recordingState !== 'idle'"
            @keydown.enter.exact.prevent="send()"
          ></textarea>
          <button
            v-if="isStreaming"
            type="button"
            class="send-btn"
            aria-label="Stop the reply"
            @click="stopStreaming"
          >
            <CircleStop :size="20" />
          </button>
          <button v-else type="submit" class="send-btn" aria-label="Send" :disabled="!draft.trim()">
            <SendHorizontal :size="20" />
          </button>
        </form>
        <p class="hint">Enter to send · Shift + Enter for a new line</p>
      </footer>
    </section>

    <v-dialog v-model="confirmClear" max-width="380">
      <v-card class="pa-2">
        <v-card-title>Start a new chat?</v-card-title>
        <v-card-text>This conversation will be deleted.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmClear = false">Cancel</v-btn>
          <v-btn color="error" @click="clearChat">Delete chat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onBeforeUnmount } from 'vue'
import { toast } from 'vue3-toastify'
import { CircleAlert, CircleStop, MessageCircle, Mic, SendHorizontal, Trash2, Volume2, X } from '@lucide/vue'
import { authFetch } from '@/services/apiClient'
import { userStore } from '@/stores/userStore'

const HISTORY_KEY = 'chatHistory'
const HISTORY_SENT = 10
const MAX_RECORD_SECONDS = 60

let idCounter = 0
const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`

const suggestions = [
  'Give me a story idea',
  'How do I use commas?',
  'Make this sentence better: the dog run fast',
  'Tips for a good story ending',
]

const isOpen = ref(false)
const draft = ref('')
const messages = ref(loadHistory())
const isStreaming = ref(false)
const confirmClear = ref(false)
const toggleButton = ref(null)
const input = ref(null)
const scroller = ref(null)
let abortController = null


function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
    return saved
      .map((m) => ({
        id: m.id ?? newId(),
        role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
        content: m.content ?? m.text ?? '',
      }))
      .filter((m) => m.content)
  } catch {
    return []
  }
}

watch(
  messages,
  (list) => {
    const finished = list.filter((m) => !m.streaming && !m.error && m.content)
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(finished.map(({ id, role, content }) => ({ id, role, content }))),
    )
  },
  { deep: true },
)

const onKeydown = (e) => {
  if (e.key === 'Escape' && !confirmClear.value) close()
}
watch(isOpen, (value) =>
  value
    ? document.addEventListener('keydown', onKeydown)
    : document.removeEventListener('keydown', onKeydown),
)

const open = async () => {
  isOpen.value = true
  await nextTick()
  scrollToBottom()
  input.value?.focus()
}

const close = () => {
  isOpen.value = false
  toggleButton.value?.focus()
}

const scrollToBottom = () =>
  nextTick(() => {
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  })

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const format = (text) =>
  escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
    .replace(/\n/g, '<br>')

// ---- Chat -----------------------------------------------------------------

const send = async (text = draft.value) => {
  const content = text.trim()
  if (!content || isStreaming.value) return
  draft.value = ''

  const history = messages.value
    .filter((m) => m.content && !m.error)
    .slice(-HISTORY_SENT)
    .map(({ role, content }) => ({ role, content }))

  messages.value.push({ id: newId(), role: 'user', content })
  await streamReply(content, history)
}

const retry = async (failed) => {
  const index = messages.value.indexOf(failed)
  const prompt = messages.value[index - 1]
  if (!prompt) return
  messages.value.splice(index - 1, 2)
  await send(prompt.content)
}

const streamReply = async (message, conversation) => {
  messages.value.push({ id: newId(), role: 'assistant', content: '', streaming: true })
  // Use the reactive proxy so streamed text re-renders.
  const reply = messages.value[messages.value.length - 1]
  isStreaming.value = true
  abortController = new AbortController()
  scrollToBottom()

  try {
    const response = await authFetch('/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversation }),
      signal: abortController.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    // Server-sent events: "data: {json}\n\n". Events can be split across chunks.
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop()
      for (const event of events) {
        const data = event.replace(/^data: ?/, '').trim()
        if (!data || data === '[DONE]') continue
        const chunk = JSON.parse(data)
        if (chunk.error) throw new Error(chunk.error)
        if (chunk.response) {
          reply.content += chunk.response
          scrollToBottom()
        }
      }
    }
    if (!reply.content) throw new Error('Empty reply')
  } catch (err) {
    if (err.name !== 'AbortError') {
      reply.error = 'The helper couldn’t answer just now.'
    } else if (!reply.content) {
      reply.content = '(Stopped)'
    }
  } finally {
    reply.streaming = false
    isStreaming.value = false
    abortController = null
    scrollToBottom()
  }
}

const stopStreaming = () => abortController?.abort()

const clearChat = () => {
  stopStreaming()
  stopSpeaking()
  messages.value = []
  confirmClear.value = false
  input.value?.focus()
}

// ---- Voice input ------------------------------------------------------------

const recordingState = ref('idle') // idle | recording | transcribing
const recordSeconds = ref(0)
let recorder = null
let recordTimer = null

const toggleRecording = () => (recordingState.value === 'recording' ? stopRecording() : startRecording())

const startRecording = async () => {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    toast.error('Voice input isn’t supported in this browser.')
    return
  }
  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch {
    toast.error('Please allow microphone access to use voice input.')
    return
  }

  const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) =>
    MediaRecorder.isTypeSupported(t),
  )
  const chunks = []
  recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  recorder.onstop = () => {
    stream.getTracks().forEach((t) => t.stop())
    transcribe(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }))
  }
  recorder.start()

  recordingState.value = 'recording'
  recordSeconds.value = 0
  recordTimer = setInterval(() => {
    recordSeconds.value++
    if (recordSeconds.value >= MAX_RECORD_SECONDS) stopRecording()
  }, 1000)
}

const stopRecording = () => {
  clearInterval(recordTimer)
  if (recorder?.state === 'recording') {
    recordingState.value = 'transcribing'
    recorder.stop()
  }
}

// Whisper turns silence and noise into markers like "[BLANK_AUDIO]", "(music)" or "* * *".
const cleanTranscript = (text = '') => {
  const cleaned = text
    .replace(/\[[^\]]*\]|\((?:\s*[\w'-]+){1,2}\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return /[\p{L}\p{N}]/u.test(cleaned) ? cleaned : ''
}

const transcribe = async (blob) => {
  try {
    if (blob.size === 0) throw new Error('empty')
    const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'
    const body = new FormData()
    body.append('audio', blob, `recording.${ext}`)
    const response = await authFetch('/chat/speech-to-text', { method: 'POST', body })
    if (response.status === 503) throw new Error('Voice input isn’t available right now.')
    if (!response.ok) throw new Error('We couldn’t understand the recording. Please try again.')
    const { text } = await response.json()
    const spoken = cleanTranscript(text)
    if (!spoken) throw new Error('We didn’t hear anything. Try speaking a little louder.')
    // Let the user check and edit the text before sending.
    draft.value = draft.value ? `${draft.value} ${spoken}` : spoken
  } catch (err) {
    toast.error(err.message === 'empty' ? 'Nothing was recorded. Please try again.' : err.message)
  } finally {
    recordingState.value = 'idle'
    await nextTick()
    input.value?.focus()
  }
}

// ---- Read aloud -------------------------------------------------------------

const speakingId = ref(null)
const loadingSpeechId = ref(null)
let audio = null

const stopSpeaking = () => {
  if (audio) {
    audio.pause()
    URL.revokeObjectURL(audio.src)
    audio = null
  }
  speakingId.value = null
}

const toggleSpeak = async (message) => {
  if (speakingId.value === message.id) return stopSpeaking()
  stopSpeaking()
  loadingSpeechId.value = message.id
  try {
    const response = await authFetch('/chat/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message.content.slice(0, 5000) }),
    })
    if (response.status === 503) throw new Error('Read aloud isn’t available right now.')
    if (!response.ok) throw new Error('We couldn’t read that message aloud.')
    audio = new Audio(URL.createObjectURL(await response.blob()))
    audio.onended = stopSpeaking
    await audio.play()
    speakingId.value = message.id
  } catch (err) {
    stopSpeaking()
    toast.error(err.name === 'NotAllowedError' ? 'Your browser blocked audio playback.' : err.message)
  } finally {
    loadingSpeechId.value = null
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  stopStreaming()
  stopSpeaking()
  clearInterval(recordTimer)
  if (recorder?.state === 'recording') {
    recorder.onstop = null
    recorder.stop()
    recorder.stream.getTracks().forEach((t) => t.stop())
  }
})
</script>

<style scoped>
.chat-fab {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 1100;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  height: 56px;
  padding: 0 1.25rem 0 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--ink-primary);
  color: #fff;
  font-family: var(--ink-font-display);
  font-size: 1.05rem;
  box-shadow: var(--ink-shadow-lg);
  cursor: pointer;
  transition: transform 0.15s, background-color 0.15s;
}

.chat-fab:hover {
  background: var(--ink-primary-strong);
  transform: translateY(-1px);
}

.chat-panel {
  position: fixed;
  right: 1.25rem;
  bottom: calc(1.25rem + 56px + 0.75rem);
  z-index: 1100;
  width: min(420px, calc(100vw - 2.5rem));
  height: min(620px, calc(100vh - var(--ink-header-height) - 120px));
  display: flex;
  flex-direction: column;
  background: var(--ink-surface);
  border: 1px solid var(--ink-border);
  border-radius: var(--ink-radius-lg);
  box-shadow: var(--ink-shadow-lg);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem 1rem 0.75rem 1.25rem;
  border-bottom: 1px solid var(--ink-border);
}

.chat-header h2 {
  font-size: 1.2rem;
}

.chat-sub {
  font-size: 0.85rem;
  color: var(--ink-text-muted);
}

.header-actions {
  display: flex;
  gap: 0.25rem;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--ink-text-muted);
  cursor: pointer;
}

.icon-btn:hover:not(:disabled) {
  background: var(--ink-primary-soft);
  color: var(--ink-primary);
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--ink-bg);
}

.welcome {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.suggestion {
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--ink-border);
  border-radius: var(--ink-radius-sm);
  background: var(--ink-surface);
  color: var(--ink-primary-strong);
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.suggestion:hover {
  border-color: var(--ink-primary);
  background: var(--ink-primary-soft);
}

.msg {
  display: flex;
  flex-direction: column;
  max-width: 88%;
}

.msg.user {
  align-self: flex-end;
  align-items: flex-end;
}

.msg.assistant {
  align-self: flex-start;
}

.bubble {
  padding: 0.65rem 0.9rem;
  border-radius: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}

.user .bubble {
  background: var(--ink-primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.assistant .bubble {
  background: var(--ink-surface);
  border: 1px solid var(--ink-border);
  border-bottom-left-radius: 4px;
}

.msg-error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.25rem;
  color: var(--ink-red);
  font-size: 0.9rem;
}

.link-btn {
  border: 0;
  background: none;
  padding: 0;
  color: var(--ink-primary);
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.msg-tools {
  margin-top: 0.25rem;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--ink-text-muted);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.tool-btn:hover:not(:disabled) {
  background: var(--ink-primary-soft);
  color: var(--ink-primary);
}

.typing {
  display: flex;
  gap: 4px;
  padding: 0.35rem 0;
}

.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ink-text-muted);
  animation: bounce 1.2s infinite ease-in-out;
}

.typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.composer {
  padding: 0.75rem 1rem 0.6rem;
  border-top: 1px solid var(--ink-border);
}

.voice-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ink-primary-strong);
}

.rec-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ink-red);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}

.composer-row {
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
}

.mic.recording {
  background: var(--ink-red-soft);
  color: var(--ink-red);
}

textarea {
  flex: 1;
  min-height: 42px;
  max-height: 120px;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--ink-border);
  border-radius: 12px;
  font: inherit;
  resize: none;
  field-sizing: content;
}

textarea:focus {
  outline: none;
  border-color: var(--ink-primary);
  box-shadow: 0 0 0 3px var(--ink-primary-soft);
}

.send-btn {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 0;
  border-radius: 12px;
  background: var(--ink-primary);
  color: #fff;
  cursor: pointer;
}

.send-btn:disabled {
  background: var(--ink-border);
  color: var(--ink-text-muted);
  cursor: not-allowed;
}

.hint {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: var(--ink-text-muted);
  text-align: center;
}

@media (max-width: 760px) {
  .chat-fab {
    bottom: calc(var(--ink-tabbar-height) + env(safe-area-inset-bottom) + 0.75rem);
    width: 56px;
    padding: 0;
    justify-content: center;
  }

  .fab-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }

  .chat-fab.open {
    display: none;
  }

  .chat-panel {
    inset: var(--ink-header-height) 0 calc(var(--ink-tabbar-height) + env(safe-area-inset-bottom)) 0;
    width: 100%;
    height: auto;
    border-radius: 0;
    border: 0;
  }
}
</style>
