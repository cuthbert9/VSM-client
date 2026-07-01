<script setup lang="ts">
import { ref } from 'vue'
import { scheduleVisit } from '../Services/visitsService'
import axios from 'axios'


const offices = ref([
  { id: 1, name: 'Main HQ - Executive Suite (Room 401)' },
  { id: 2, name: 'Research & Development Lab (Room 102)' },
  { id: 3, name: 'Sales & Marketing Office (Room 205)' },
  { id: 4, name: 'Operations & Support Center (Room 312)' }
])

const parkingLots = ref([
  "LotA",
  "LotB",
  "LotC",
  "LotD"
])

const form = ref({
  visitorName: '',
  visitorEmail: '',
  visitorPhone: '',
  visitorCompany: '',
  officeId: 1,
  visitDate: '',
  expectedArrival: '',
  purpose: '',
  attachmentUrl: '',
  reserveParking: false,
  parkingSpotPreference: 'General',
  vehiclePlate: ''
}) 

const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const attachmentName = ref('')
const formSubmittedData = ref<any>(null)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    attachmentName.value = file.name
    form.value.attachmentUrl = `https://assets.visitflow.internal/attachments/${encodeURIComponent(file.name)}`
  }
}


const submitVisitForm = async (form :any) => {


  try {
    

      const response = axios.post("http://localhost:5207/api/Visits",form.value)      

    // success only here
       if(response) {
         formSubmittedData.value = response
    showSuccessModal.value = true
       }

  } catch (error) {
    console.error("Failed to schedule visit:", error)
    alert("Failed to submit visit. Try again.")
  } finally {
    isSubmitting.value = false
   
  }
}


// Reset form helper
const resetForm = () => {
  form.value = {
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    visitorCompany: '',
    officeId: 1,
    visitDate: '',
    expectedArrival: '',
    purpose: '',
    attachmentUrl: '',
    reserveParking: false,
    parkingSpotPreference: 'General',
    vehiclePlate: ''
  }
  attachmentName.value = ''
  showSuccessModal.value = false
  formSubmittedData.value = null
}
</script>

<template>
  <main class="max-w-5xl mx-auto space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center justify-between pb-5 border-b border-gray-300">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Schedule a Visit</h1>
        <p class="text-sm text-slate-500 mt-1">Create a new visitor invitation and allocate resources.</p>
      </div>
      <button 
        @click="resetForm"
        class="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm hover:bg-slate-50 transition"
      >
        Clear Form
      </button>
    </div>

    <!-- Form Container -->
    <form @submit.prevent="submitVisitForm" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left 2 Columns: Visitor & Visit Details -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Card: Visitor Details -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">Visitor Details</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
              <input 
                v-model="form.visitorName"
                type="text" 
                required 
                placeholder="e.g. John Doe"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email Address *</label>
              <input 
                v-model="form.visitorEmail"
                type="email" 
                required 
                placeholder="e.g. john@company.com"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone Number</label>
              <input 
                v-model="form.visitorPhone"
                type="tel" 
                placeholder="e.g. +1 (555) 019-2834"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Company / Organization</label>
              <input 
                v-model="form.visitorCompany"
                type="text" 
                placeholder="e.g. Acme Corp"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Card: Visit Details -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
           
            <h2 class="text-lg font-bold text-slate-800">Visit Parameters</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Target Office *</label>
              <select 
                v-model="form.officeId"
                required
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="" disabled selected>Select destination office</option>
                <option v-for="office in offices" :key="office.id" :value="office.id">
                  {{ office.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Purpose of Visit</label>
              <textarea 
                v-model="form.purpose"
                rows="4" 
                placeholder="Brief description of the visit purpose..."
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              ></textarea>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Date, Parking, & Attachments -->
      <div class="space-y-6">
        
        <!-- Card: Timing & Arrival -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
      
            <h2 class="text-lg font-bold text-slate-800">Timing</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Visit Date & Time *</label>
              <input 
                v-model="form.visitDate"
                type="datetime-local" 
                required
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Expected Arrival Time</label>
              <input 
                v-model="form.expectedArrival"
                type="datetime-local" 
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Card: Parking Options -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
            
              <h2 class="text-lg font-bold text-slate-800">Parking</h2>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.reserveParking" class="sr-only peer">
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div v-if="form.reserveParking" class="space-y-4 pt-1">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Vehicle Plate Number</label>
              <input 
                v-model="form.vehiclePlate"
                type="text" 
                placeholder="e.g. XYZ 9876"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Parking Area Preference</label>
              <select 
                v-model="form.parkingSpotPreference"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option v-for="lot in parkingLots" :key="lot" :value="lot">
                  {{ lot }}
                </option>
              </select>
            </div>
          </div>
          <div v-else class="text-xs text-slate-400 italic text-center py-2">
            No parking reservation requested.
          </div>
        </div>

        <!-- Card: Attachment upload -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            
            <h2 class="text-lg font-bold text-slate-800">Attachments</h2>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-center w-full">
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition duration-150">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
               
                  <p class="text-xs text-slate-500"><span class="font-semibold">Click to upload</span> files</p>
                  <p class="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</p>
                </div>
                <input type="file" class="hidden" @change="handleFileUpload" />
              </label>
            </div>
            <div v-if="attachmentName" class="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
              <span class="truncate font-medium">{{ attachmentName }}</span>
              <button type="button" @click="attachmentName = ''; form.attachmentUrl = ''" class="text-blue-500 hover:text-blue-800">✕</button>
            </div>
          </div>
        </div>

        <!-- Action Panel -->
        <div class="pt-2">
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all transform hover:-translate-y-[1px] disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            <span>{{ isSubmitting ? 'Scheduling Visit...' : 'Confirm Schedule' }}</span>
          </button>
        </div>

      </div>

    </form>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative transform transition-all scale-100">
        
        <!-- Header -->
        <div class="text-center space-y-2 mb-6">
          <div class="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl">
            ✓
          </div>
          <h3 class="text-xl font-bold text-slate-900">Visit Scheduled Successfully!</h3>
          <p class="text-sm text-slate-500">The visit request has been recorded and is ready for the backend.</p>
        </div>

        <!-- Info summary -->
        <div v-if="formSubmittedData" class="bg-slate-50 rounded-xl p-4 text-sm space-y-3 border border-slate-100">
          <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span class="text-slate-500">Visitor:</span>
            <span class="font-semibold text-slate-800">{{ formSubmittedData.visitorName }}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span class="text-slate-500">Email:</span>
            <span class="font-mono text-xs text-slate-800">{{ formSubmittedData.visitorEmail }}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span class="text-slate-500">Destination:</span>
            <span class="font-medium text-slate-800">
              {{ offices.find(o => o.id === formSubmittedData.officeId)?.name || 'Office #' + formSubmittedData.officeId }}
            </span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span class="text-slate-500">Scheduled Date:</span>
            <span class="font-mono text-xs text-slate-800">{{ formSubmittedData.visitDate.replace('T', ' ') }}</span>
          </div>
          <div v-if="formSubmittedData.reserveParking" class="flex justify-between">
            <span class="text-slate-500">Parking Allocated:</span>
            <span class="font-semibold text-emerald-600">Yes ({{ formSubmittedData.parkingSpotPreference }} Spot)</span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="mt-6 flex gap-3">
          <button 
            @click="resetForm" 
            class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
          >
            Create Another
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

