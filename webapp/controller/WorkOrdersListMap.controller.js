// @ts-nocheck
sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict'

  return Controller.extend('mobility.controller.WorkOrdersListMap', {
    onAfterRendering: async function () {
      const oWorkOrdersAddressModel = this.getOwnerComponent().getModel('workOrdersAddressModel')
      const oAddressData = oWorkOrdersAddressModel.getData()
      console.log(oAddressData)
      let updatedAddresses
      this._getCoordinates(oAddressData)
        .then((data) => {
          updatedAddresses = oAddressData.map((address, index) => ({
            ...address,
            lat: data[index].lat,
            lng: data[index].lng,
          }))
          console.log('Updated addresses:', updatedAddresses)
          // Use the updatedAddresses array with latitude, longitude, and orderID
          this._constructMarker(updatedAddresses)
        })
        .catch((error) => {
          console.error('Error:', error)
        })

      // const oCoordinatesData = this._getCoordinates(oAddressData)
      // console.log(oCoordinatesData)
      // const results = await Promise.all(this._getCoordinates(oAddressData))
      // console.log(results)
      // this._constructMarker(oCoordinatesData)
    },

    _getCoordinates: async function (oAddressData) {
      const results = await Promise.all(oAddressData.map(this._getLatLong))
      console.log(results)
      return results.filter((result) => result !== null) // Filter out null results

      console.log(oAddressData)
      return await oAddressData.map(async ({ fullAddress, orderID }, i) => {
        const coordinates = await this._getLatLong(fullAddress)
        console.log(coordinates)
        return {
          fullAddress,
          orderID,
          coordinates,
        }
        // .then((coordinates) => {
        //   oAddressData[i].coordinates = coordinates
        //   oAddressData[i].lat = coordinates.lat
        //   oAddressData[i].lng = coordinates.lng
        // })
        // .catch((error) => {
        //   console.error('Error:', error)
        // })
      })
      // console.log(oAddressDataWithLatLng)
      // return oAddressDataWithLatLng
    },

    _constructMarker: async function (oCoordinatesData) {
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')

      console.log(oCoordinatesData)

      // Create an empty LatLngBounds object
      const bounds = new google.maps.LatLngBounds()

      oCoordinatesData.forEach((data) => {
        const { coordinates, orderID, fullAddress, lat, lng } = data
        console.log(data, fullAddress, orderID, coordinates, lat, lng)
        const beachFlagImg = document.createElement('img')
        // beachFlagImg.src =
          'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
        beachFlagImg.src = `https://via.placeholder.com/30/FF0000/FFFFFF?text=${orderID}`
        const marker = new AdvancedMarkerElement({
          content: beachFlagImg,
          position: { lat: lat, lng: lng },
          title: orderID,
          map: window['mobilityMap'],
        })
        bounds.extend({ lat: lat, lng: lng })
      })

      // Adjust the map's center and zoom level based on the bounds
      window['mobilityMap'].fitBounds(bounds)
      // window['mobilityMap'].setCenter(oCoordinatesData[0].coordinates)
      // const position = { lat: -25.344, lng: 131.031 }
      // const map = new google.maps.Map(document.getElementById('map'), {
      //   zoom: 4,
      //   center: position,
      //   mapId: 'DEMO_MAP_ID', // Map ID is required for advanced markers.
      // })
      // // The advanced marker, positioned at Uluru
      // const marker = new google.maps.marker.AdvancedMarkerElement({
      //   map,
      //   position: position,
      //   title: 'Uluru',
      // })
    },

    _getLatLong: async function ({ fullAddress }) {
      const { Geocoder } = await google.maps.importLibrary('geocoding')

      const geocoder = new Geocoder()

      return new Promise((resolve, reject) => {
        geocoder.geocode({ address: fullAddress }, (results, status) => {
          if (status === 'OK' && results.length > 0) {
            const location = results[0].geometry.location
            const lat = location.lat()
            const lng = location.lng()
            resolve({ lat, lng })
          } else {
            reject('Geocode was not successful for the following reason: ' + status)
          }
        })
      })
    },
  })
})
