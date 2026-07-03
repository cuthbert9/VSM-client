<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

import { supabase} from "../lib/supabase.ts"

const form = ref({
  fullName: '',
  phone: '',
  nationalId: '',
  company: '',
  vehiclePlate: '',
  photoUrl: ''
})

const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const attachmentName = ref('')
const formSubmittedData = ref<any>(null)
const submitError = ref('')



// const handleFileUpload = (event: Event) => {
//   const target = event.target as HTMLInputElement
//   if (target.files && target.files[0]) {
//     const file = target.files[0]
//     attachmentName.value = file.name
//     form.value.photoUrl = `https://example.com/photos/${encodeURIComponent(file.name)}`
//   }
// }



const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement

  if (!target.files || target.files.length === 0) {
    return
  }

  const file = target.files[0]

  // Show selected file name
  attachmentName.value = file.name

  try {
    // Create unique filename
    const fileName = `${crypto.randomUUID()}-${file.name}`

    // Upload to Supabase Storage (bucket name MUST match exactly)
    const { error } = await supabase.storage
      .from("Attachments")
      .upload(fileName, file)

    if (error) {
      throw error
    }

    // Get public URL
    const { data } = supabase.storage
      .from("Attachments")
      .getPublicUrl(fileName)

    // Save URL
    form.value.photoUrl = data.publicUrl

    console.log("Upload successful:", data.publicUrl)
  } catch (error) {
    console.error("Upload failed:", error)

    attachmentName.value = ""
    form.value.photoUrl = ""
  }
}


const buildVisitorPayload = () => ({
  fullName: form.value.fullName.trim(),
  phone: form.value.phone.trim(),
  nationalId: form.value.nationalId.trim(),
  company: form.value.company.trim() || null,
  vehiclePlate: form.value.vehiclePlate.trim() || null,
  photoUrl: form.value.photoUrl.trim() || null
})

const extractErrorMessage = (error: any) => {
  const responseData = error?.response?.data

  if (responseData?.errors && typeof responseData.errors === 'object') {
    return Object.entries(responseData.errors)
      .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
      .join(' | ')
  }

  return responseData?.title || responseData?.message || error?.message || 'Failed to register visitor. Try again.'
}

const submitVisitForm = async () => {
  isSubmitting.value = true
  submitError.value = ''
  const payload = buildVisitorPayload()

  try {
    console.log('Submitting visitor payload:', payload)

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

    if (!apiBaseUrl) {
      throw new Error('Missing required env var: VITE_API_BASE_URL.')
    }

    const response = await axios.post(`${apiBaseUrl}/visitors`, payload)

    if (response?.data) {
      formSubmittedData.value = response.data
      showSuccessModal.value = true
    }
  } catch (error) {
    submitError.value = extractErrorMessage(error)
    // console.error('Failed to register visitor:', error?.response?.status, error?.response?.data || error)
    alert(submitError.value)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    fullName: '',
    phone: '',
    nationalId: '',
    company: '',
    vehiclePlate: '',
    photoUrl: ''
  }
  attachmentName.value = ''
  submitError.value = ''
  showSuccessModal.value = false
  formSubmittedData.value = null
}

</script>

<template>
  <main class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between pb-5 border-b border-gray-300">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Register Visitor</h1>
        <p class="text-sm text-slate-500 mt-1">Create a visitor record now. Visit scheduling can come next.</p>
      </div>
      <button
        @click="handleFileUpload"
        class="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm hover:bg-slate-50 transition"
      >
        Upload File
      </button>
    </div>

    <form @submit.prevent="submitVisitForm" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">Visitor Details</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
              <input
                v-model="form.fullName"
                type="text"
                required
                placeholder="e.g. Jane Visitor"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone *</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                placeholder="e.g. 0799993999"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">National ID *</label>
              <input
                v-model="form.nationalId"
                type="text"
                required
                placeholder="e.g. NIDA-123456782"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Company / Organization</label>
              <input
                v-model="form.company"
                type="text"
                placeholder="e.g. Acme Logistics"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Vehicle Plate</label>
              <input
                v-model="form.vehiclePlate"
                type="text"
                placeholder="e.g. T123ABC"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Photo URL</label>
              <input
                v-model="form.photoUrl"
                type="url"
                placeholder="https://example.com/photos/jane-visitor.jpg"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">Attachment</h2>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-center w-full">
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition duration-150">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <p class="mb-1 text-sm  text-slate-500"><span class="font-semibold">Click to upload</span> </p>
                  <p class="text-[10px] text-slate-400">PDF ,JPG, PNG </p>
                </div>
                <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
              </label>
            </div>
            <div v-if="attachmentName" class="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
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



    <form  class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">Schedule a Visit </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Office  *</label>
              <input
               
                type="text"
                required
                placeholder="e.g. 14rd Floor,Mag"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone *</label>
              <input
               
                type="tel"
                required
                placeholder="e.g. 0799993999"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Visit Date  *</label>
              <input               
                type="date"
                required
                placeholder="e.g. NIDA-123456782"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Expected Arrival </label>
              <input
              
                type="time"
                placeholder=""
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Visit Purpose </label>
              <input
                
                type="text"
                placeholder="Registration follow-up"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Photo URL</label>
              <input
               
                type="url"
                placeholder="https://example.com/photos/jane-visitor.jpg"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

    
    </form>

    <div v-if="showSuccessModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative transform transition-all scale-100">
        <div class="text-center space-y-2 mb-6">
          <div class="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl">
            ✓
          </div>
          <h3 class="text-xl font-bold text-slate-900">Visitor Registered Successfully!</h3>
          <p class="text-sm text-slate-500">The visitor record has been created.</p>
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
            @click="resetForm"
            class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
          >
            Register Another
          </button>
          <button
            @click="showSuccessModal = false"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
