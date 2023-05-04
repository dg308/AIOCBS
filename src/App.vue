<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-info">
      <div class="container">
        <a class="navbar-brand" href="#">Cab Price Comparison</a>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item active">
              <a class="nav-link" href="#">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">About</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6">
          <form>
            <div class="form-group">
              <label for="pickup-location">Pickup Location</label>
              <input
                type="text"
                class="form-control"
                id="pickupInput"
                placeholder="Enter pickup location"
                ref="pickupInput"
                v-model="pickupLocation"
              />
            </div>
            <div class="form-group">
              <label for="dropoff-location">Dropoff Location</label>
              <input
                type="text"
                class="form-control"
                id="dropoffInput"
                placeholder="Enter dropoff location"
                ref="dropoffInput"
                v-model="dropoffLocation"
              />
            </div>
            <button type="submit" class="btn btn-info" @click.prevent="onSubmit">Get Average Prices</button>
          </form>
        </div>
        <div class="col-md-6">
          <!-- Section for displaying average prices -->
          <div v-if="cabServices && cabServices.length">
            <h3>Available Services</h3>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Price</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
           
                <tr v-for="cabService in cabServices" :key="cabService.id">
                 <td>{{ cabService.name }}</td>
                <td>${{ cabService.averagePrice.toFixed(2) }}</td>
                <td>
                  <button @click="comparePrices(cabService)">Compare</button>
               </td>
              </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
/* global google */
export default {
  name: 'App',
  data() {
    return {
      showAveragePrices: false,
      apiReady: false,
      pickupLocation: '',
      dropoffLocation: '',
      cabServices: [],
      priceDifferences: [],
    };
  },

  methods: {
   

    selectService(cabService) {
      // Add logic for handling selected cab service
      alert(`Selected service: ${cabService.name} - Average Price: ${cabService.averagePrice}`);
    },

    currency(value) {
      return '$' + parseFloat(value).toFixed(2);
    },

    initAutocomplete() {
      if (!this.apiReady) return;

      const initAutocompleteInterval = setInterval(() => {
        if (google && google.maps && google.maps.places) {
          clearInterval(initAutocompleteInterval);

          const pickupInput = this.$refs.pickupInput;
      const dropoffInput = this.$refs.dropoffInput;

      new google.maps.places.Autocomplete(pickupInput);
      new google.maps.places.Autocomplete(dropoffInput);
    }
  }, 100);
},
async getAveragePrices() {
  try {
    const pickupLocation = this.pickupLocation.replace(/\+/g, ' ');
    const dropoffLocation = this.dropoffLocation.replace(/\+/g, ' ');
    const response = await fetch(
      `http://localhost:3000/prices?pickup=${encodeURIComponent(pickupLocation)}&dropoff=${encodeURIComponent(dropoffLocation)}`
    );
    if (!response.ok) {
      throw new Error("Error fetching prices");
    }
    const prices = await response.json();
    console.log("Received response from server:", prices); // Added this line
    console.log("Prices from server:", prices);

    const cabServicesMap = {};

    prices.forEach((price) => {
      if (!cabServicesMap[price.cab_name]) {
        cabServicesMap[price.cab_name] = { count: 0, total: 0 };
      }
      cabServicesMap[price.cab_name].count += 1;
      cabServicesMap[price.cab_name].total += parseFloat(price.average_price);
    });

    this.cabServices = Object.keys(cabServicesMap).map((cabName) => {
      const averagePrice = cabServicesMap[cabName].total / cabServicesMap[cabName].count;
      console.log(`${cabName} average price:`, averagePrice); // Added this line
      return {
        id: cabName,
        name: cabName,
        averagePrice: averagePrice,
      };
    });

    console.log("Processed cabServices:", this.cabServices);
  } catch (error) {
    console.error(error);
    this.errorMessage = "Error fetching prices";
  }
},





onSubmit: async function () {
  this.errorMessage = "";
  this.pickupLocation = this.pickupLocation.split(',')[0].trim();
  this.dropoffLocation = this.dropoffLocation.split(',')[0].trim();
  console.log("Updated pickup location:", this.pickupLocation);
  console.log("Updated dropoff location:", this.dropoffLocation);
  await this.getAveragePrices();
},



comparePrices(selectedCabService) {
  const priceDifferences = this.cabServices.map((cabService) => {
    const difference = selectedCabService.averagePrice - cabService.averagePrice;
    return {
      id: cabService.id,
      name: cabService.name,
      difference: difference,
      percentageDifference: ((difference / cabService.averagePrice) * 100).toFixed(2),
    };
  });

  this.priceDifferences = priceDifferences;
},





async mounted() {
  const googleMapsApiKey = 'AIzaSyApp_taYSOxOFgwhB5Qq4TDuR2hc2KBrcg';
  const loadGoogleMaps = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      document.body.appendChild(script);
    });
  };

  await loadGoogleMaps();
  this.apiReady = true;
  this.initAutocomplete();
},
},

created() {
  },



};
</script>

<style>
:root {
  --primary-color: #007BFF;
  --secondary-color: #6C757D;
  --success-color: #28A745;
  --info-color: #17A2B8;
  --warning-color: #FFC107;
  --danger-color: #DC3545;
  --light-color: #F8F9FA;
  --dark-color: #343A40;
}

#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

  .btn-primary {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
  }

  .badge-primary {
    background-color: var(--primary-color);
  }
}
</style>
