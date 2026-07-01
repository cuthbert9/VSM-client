


<template>
  <aside
    class="w-72 h-screen fixed bg-gray-800 border-r border-gray-200 flex flex-col shadow-sm"
  >
    <!-- Header -->
    <div class="px-6 py-8 border-b border-gray-100">
      <h1 class="text-2xl font-bold text-black">
        VisitUs
      </h1>
      <p class="text-sm text-black mt-1">
        Visitation Management System
      </p>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6">
      <ul class="space-y-3">

        <!-- Schedule Visit -->
        <li>
          <button
            @click="scheduleVisit"
            class="w-full flex items-center gap-4 px-4 py-4 rounded-2xl
                 bg-gray-600   text-black font-medium
                   hover:bg-gray-500 transition"
          >
           

            <div class="text-left">
              <p class="font-semibold ">
                Schedule a Visit
              </p>

              <p class="text-xs text-black">
                Create new visit requests
              </p>
            </div>
          </button>
        </li>

        <!-- Follow Up -->
        <li>
          <button
            @click="followUp"
            class="w-full flex items-center gap-4 px-4 py-4 rounded-2xl
                   text-black hover:bg-gray-500 transition"
          >
       
            <div class="text-left">
              <p class="font-semibold">
                Follow Up
              </p>

              <p class="text-xs text-black ">
                Track scheduled visits
              </p>
            </div>
          </button>
        </li>

        <!-- Parking Reservation -->
        <li>
          <button
            @click="parkingReservation"
            class="w-full flex items-center gap-4 px-4 py-4 rounded-2xl
                   text-black hover:bg-gray-500 transition"
          >
        
            <div class="text-left">
              <p class="font-semibold">
                Parking Reservation
              </p>

              <p class="text-xs text-black">
                Reserve visitor parking
              </p>
            </div>
          </button>
        </li>

      </ul>
    </nav>

    <!-- Footer -->
    <div class="p-5 border-t border-gray-100">
      <div
        class="rounded-2xl bg-gray-500 p-4 text-sm text-black"
      >
        Visitor access management
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">

const scheduleVisit = () => {
  console.log('Schedule Visit')
}

const followUp = () => {
  console.log('Follow Up')
}

const parkingReservation = () => {
  console.log('Parking Reservation')
}

</script>

    
