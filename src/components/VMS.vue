<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import FormField from './FormField.vue'
import { supabase } from '../lib/supabase.ts'
import {
  createVisit,
  createVisitor,
  getOffices,
  type Office,
} from '../Services/visitsService.ts'

const form = ref({
  fullName: '',
  phone: '',
  nationalId: '',
  company: '',
  vehiclePlate: '',
  photoUrl: '',
})

const visitForm = ref({
  visitorId: null as number | null,
  officeId: '' as string | number,
  visitDate: '',
  expectedArrival: '',
  purpose: '',
  attachmentUrl: '',
})

const offices = ref<Office[]>([])
const isLoadingOffices = ref(false)
const officesError = ref('')

const isSubmitting = ref(false)
const isSubmittingVisit = ref(false)
const showSuccessModal = ref(false)
const showVisitSuccessModal = ref(false)
const attachmentName = ref('')
const visitAttachmentName = ref('')
const formSubmittedData = ref<any>(null)
const visitSubmittedData = ref<any>(null)
const submitError = ref('')
const visitSubmitError = ref('')

const createdVisitorLabel = computed(() => {
  const visitor = formSubmittedData.value
  if (!visitor && !visitForm.value.visitorId) return ''
  const name = visitor?.fullName || form.value.fullName
  const id = visitForm.value.visitorId
  return name ? `${name} (ID: ${id})` : `Visitor ID: ${id}`
})

const officeOptions = computed(() =>
  offices.value.map((office) => ({
    value: office.id,
    label: String(office.name ?? office.officeName ?? `Office #${office.id}`),
  }))
)

const officePlaceholder = computed(() =>
  isLoadingOffices.value ? 'Loading offices...' : 'Select an office'
)

const toIsoDateTime = (value: string) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const uploadAttachment = async (file: File): Promise<string> => {
  const fileName = `${crypto.randomUUID()}-${file.name}`

  const { error } = await supabase.storage.from('Attachments').upload(fileName, file)
  if (error) throw error

  const { data } = supabase.storage.from('Attachments').getPublicUrl(fileName)
  return data.publicUrl
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  attachmentName.value = file.name

  try {
    form.value.photoUrl = await uploadAttachment(file)
  } catch (error) {
    console.error('Upload failed:', error)
    attachmentName.value = ''
    form.value.photoUrl = ''
  }
}

const handleVisitFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  visitAttachmentName.value = file.name

  try {
    visitForm.value.attachmentUrl = await uploadAttachment(file)
  } catch (error) {
    console.error('Visit attachment upload failed:', error)
    visitAttachmentName.value = ''
    visitForm.value.attachmentUrl = ''
  }
}

const clearVisitAttachment = () => {
  visitAttachmentName.value = ''
  visitForm.value.attachmentUrl = ''
}

const buildVisitorPayload = () => ({
  fullName: form.value.fullName.trim(),
  phone: form.value.phone.trim(),
  nationalId: form.value.nationalId.trim(),
  company: form.value.company.trim() || null,
  vehiclePlate: form.value.vehiclePlate.trim() || null,
  photoUrl: form.value.photoUrl.trim() || null,
})

const buildVisitPayload = () => {
  const visitDate = toIsoDateTime(visitForm.value.visitDate)
  if (!visitForm.value.visitorId || !visitForm.value.officeId || !visitDate) {
    throw new Error('Visitor, office, and visit date are required.')
  }

  return {
    visitorId: Number(visitForm.value.visitorId),
    officeId: Number(visitForm.value.officeId),
    visitDate,
    expectedArrival: toIsoDateTime(visitForm.value.expectedArrival),
    purpose: visitForm.value.purpose.trim() || null,
    attachmentUrl: visitForm.value.attachmentUrl.trim() || null,
  }
}

const extractErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data

  if (responseData?.errors && typeof responseData.errors === 'object') {
    return Object.entries(responseData.errors)
      .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
      .join(' | ')
  }

  return responseData?.title || responseData?.message || error?.message || fallback
}

const loadOffices = async () => {
  isLoadingOffices.value = true
  officesError.value = ''

  try {
    offices.value = await getOffices()
  } catch (error) {
    officesError.value = extractErrorMessage(error, 'Failed to load offices.')
  } finally {
    isLoadingOffices.value = false
  }
}

const submitVisitorForm = async () => {
  isSubmitting.value = true
  submitError.value = ''
  const payload = buildVisitorPayload()

  try {
    const data = await createVisitor(payload)

    if (data) {
      formSubmittedData.value = data
      visitForm.value.visitorId = data.id ?? data.visitorId ?? null
      showSuccessModal.value = true
    }
  } catch (error) {
    submitError.value = extractErrorMessage(error, 'Failed to register visitor. Try again.')
    alert(submitError.value)
  } finally {
    isSubmitting.value = false
  }
}

const submitScheduleVisitForm = async () => {
  if (!visitForm.value.visitorId) {
    alert('Register a visitor first so the visit can be linked to them.')
    return
  }

  isSubmittingVisit.value = true
  visitSubmitError.value = ''

  try {
    const payload = buildVisitPayload()
    const data = await createVisit(payload)
    visitSubmittedData.value = data
    showVisitSuccessModal.value = true
  } catch (error) {
    visitSubmitError.value = extractErrorMessage(error, 'Failed to schedule visit. Try again.')
    alert(visitSubmitError.value)
  } finally {
    isSubmittingVisit.value = false
    resetForm()
  }
}

const resetVisitForm = () => {
  visitForm.value = {
    visitorId: formSubmittedData.value?.id ?? formSubmittedData.value?.visitorId ?? null,
    officeId: '',
    visitDate: '',
    expectedArrival: '',
    purpose: '',
    attachmentUrl: '',
  }
  visitAttachmentName.value = ''
  visitSubmitError.value = ''
  visitSubmittedData.value = null
  showVisitSuccessModal.value = false
}

const resetForm = () => {
  form.value = {
    fullName: '',
    phone: '',
    nationalId: '',
    company: '',
    vehiclePlate: '',
    photoUrl: '',
  }
  attachmentName.value = ''
  submitError.value = ''
  showSuccessModal.value = false
  formSubmittedData.value = null
  resetVisitForm()
  visitForm.value.visitorId = null
}

onMounted(() => {
  loadOffices()
})
</script>

<template>
  <main class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between pb-5 border-b border-gray-300">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Register Visitor</h1>
        <p class="text-sm text-slate-500 mt-1">Create a visitor record, then schedule their visit below.</p>
      </div>
      <button
        type="button"
        @click="resetForm"
        class="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm hover:bg-slate-50 transition"
      >
        Reset Form
      </button>
    </div>

    <form @submit.prevent="submitVisitorForm" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">Visitor Details</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              v-model="form.fullName"
              label="Full Name"
              required
              placeholder="e.g. Jane Visitor"
            />
            <FormField
              v-model="form.phone"
              label="Phone"
              type="tel"
              required
              placeholder="e.g. 0799993999"
            />
            <FormField
              v-model="form.nationalId"
              label="National ID"
              required
              placeholder="e.g. NIDA-123456782"
            />
            <FormField
              v-model="form.company"
              label="Company / Organization"
              placeholder="e.g. Acme Logistics"
            />
            <FormField
              v-model="form.vehiclePlate"
              label="Vehicle Plate"
              placeholder="e.g. T123ABC"
            />
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">Visitor Attachment</h2>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-center w-full">
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition duration-150">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <p class="mb-1 text-sm text-slate-500"><span class="font-semibold">Click to upload</span></p>
                  <p class="text-[10px] text-slate-400">PDF, JPG, PNG</p>
                </div>
                <input type="file" class="hidden" accept="image/*,.pdf" @change="handleFileUpload" />
              </label>
            </div>
            <div
              v-if="attachmentName"
              class="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100"
            >
              <span class="truncate font-medium">{{ attachmentName }}</span>
              <button type="button" @click="attachmentName = ''; form.photoUrl = ''" class="text-blue-500 hover:text-blue-800">✕</button>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all transform hover:-translate-y-[1px] disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            <span>{{ isSubmitting ? 'Registering Visitor...' : 'Register Visitor' }}</span>
          </button>
        </div>
      </div>
    </form>

    <form @submit.prevent="submitScheduleVisitForm" class="space-y-4">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <h2 class="text-lg font-bold text-slate-800">Schedule a Visit</h2>
          <span
            v-if="visitForm.visitorId"
            class="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1"
          >
            Ready for visitor
          </span>
        </div>

        <div
          v-if="!visitForm.visitorId"
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        >
          Register a visitor above first. Their details will prefill here automatically.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            class="md:col-span-2"
            :model-value="createdVisitorLabel || 'No visitor selected yet'"
            label="Visitor"
            required
            readonly
          />

          <FormField
            v-model="visitForm.officeId"
            label="Office"
            as="select"
            required
            :disabled="isLoadingOffices || !offices.length"
            :placeholder="officePlaceholder"
            :options="officeOptions"
            :error="officesError"
          />

          <FormField
            v-model="visitForm.visitDate"
            label="Visit Date"
            type="datetime-local"
            required
          />

          <FormField
            v-model="visitForm.expectedArrival"
            label="Expected Arrival"
            type="datetime-local"
          />

          <FormField
            v-model="visitForm.purpose"
            label="Visit Purpose"
            as="textarea"
            :rows="3"
            placeholder="Registration follow-up"
          />

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Attachment</label>
            <div class="flex items-center gap-2">
              <input
                type="file"
                accept="image/*,.pdf"
                @change="handleVisitFileUpload"
                class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
              />
              <button
                v-if="visitAttachmentName"
                type="button"
                @click="clearVisitAttachment"
                class="shrink-0 text-xs text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
            </div>
            <p v-if="visitAttachmentName" class="mt-1 text-xs text-slate-500 truncate">{{ visitAttachmentName }}</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isSubmittingVisit || !visitForm.visitorId"
        class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all transform hover:-translate-y-[1px] disabled:bg-blue-400 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmittingVisit" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
        <span>{{ isSubmittingVisit ? 'Scheduling Visit...' : 'Schedule a Visit' }}</span>
      </button>
    </form>

    <div v-if="showSuccessModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative transform transition-all scale-100">
        <div class="text-center space-y-2 mb-6">
          <div class="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl">
            ✓
          </div>
          <h3 class="text-xl font-bold text-slate-900">Visitor Registered Successfully!</h3>
          <p class="text-sm text-slate-500">You can now schedule a visit for this visitor below.</p>
        </div>

        <div v-if="formSubmittedData" class="bg-slate-50 rounded-xl p-4 text-sm space-y-3 border border-slate-100">
          <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span class="text-slate-500">Full Name:</span>
            <span class="font-semibold text-slate-800">{{ formSubmittedData.fullName || form.fullName }}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span class="text-slate-500">Phone:</span>
            <span class="font-mono text-xs text-slate-800">{{ formSubmittedData.phone || form.phone }}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span class="text-slate-500">National ID:</span>
            <span class="font-medium text-slate-800">{{ formSubmittedData.nationalId || form.nationalId }}</span>
          </div>
          <div v-if="formSubmittedData.company || form.company" class="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span class="text-slate-500">Company:</span>
            <span class="font-medium text-slate-800">{{ formSubmittedData.company || form.company }}</span>
          </div>
          <div v-if="formSubmittedData.vehiclePlate || form.vehiclePlate" class="flex justify-between">
            <span class="text-slate-500">Vehicle Plate:</span>
            <span class="font-semibold text-emerald-600">{{ formSubmittedData.vehiclePlate || form.vehiclePlate }}</span>
          </div>
        </div>

        <div class="mt-6 flex gap-3">
          <button
            type="button"
            @click="resetForm"
            class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
          >
            Register Another
          </button>
          <button
            type="button"
            @click="showSuccessModal = false"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm transition"
          >
            Schedule Visit
          </button>
        </div>
      </div>
    </div>

    <div v-if="showVisitSuccessModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative transform transition-all scale-100">
        <div class="text-center space-y-2 mb-6">
          <div class="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl">
            ✓
          </div>
          <h3 class="text-xl font-bold text-slate-900">Visit Scheduled Successfully!</h3>
          <p class="text-sm text-slate-500">The visit has been created for this visitor.</p>
        </div>

        <div class="mt-6 flex gap-3">
          <button
            type="button"
            @click="resetVisitForm"
            class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
          >
            Schedule Another
          </button>
          <button
            type="button"
            @click="showVisitSuccessModal = false"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
