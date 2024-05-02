// @ts-nocheck
sap.ui.define(['sap/ui/core/Control', 'sap/m/MessageBox'], function (Control, MessageBox) {
  'use strict'
  return Control.extend('mobility.control.GoogleMap', {
    metadata: {
      properties: {
        //Externalize key in order to get it from parameters or OData or whatever
        key: 'AIzaSyBGpkS0o9Y6et0Ic1SIUhVTQfocI9rzlM8',
        address: {
          type: 'string',
          defaultValue: 'Birmingham, Alabama USA',
        },
        defaultAdress: 'string',
        title: {
          type: 'string',
          defaultValue: 'Loading...',
        },
        description: 'string',
        /**
         * Google Container
         * width : Map width
         * height : Map height
         * **/
        width: {
          type: 'sap.ui.core.CSSSize',
          defaultValue: '100%',
        },
        height: {
          type: 'sap.ui.core.CSSSize',
          defaultValue: '100%',
        },
        backgroundColor: {
          type: 'sap.ui.core.CSSColor',
          defaultValue: '#C6BEBE',
        },
        /**
         * Google Variables
         * @link(https://developers.google.com/maps/documentation/javascript/examples/map-simple)
         * **/
        mapType: {
          type: 'string',
          defaultValue: 'roadmap',
        },
        mapZoom: {
          type: 'string',
          defaultValue: '17',
        },
      },
      aggregations: {},
    },
    init: function () {},
    renderer: function (oRm, oControl) {
      //Loading Style : we can externalise these Styles
      const sGlobalStyle = `width:${oControl.getWidth()};height:${oControl.getHeight()};background:${oControl.getBackgroundColor()}` // Come on it's ES6 Mr SAP
      const sLoadingStyle = `color:#A09494;text-align:center;font-size:1rem;padding-top:2rem`

      /**
       * Target
       * <div id='idoFThis' style='width:100%;height:400px;background:#C6BEBE'>
       *	<h1>Loading ....</h1>
       * </div>
       * */
      oRm.write('<div')
      oRm.writeControlData(oControl)
      oRm.writeAttributeEscaped('style', sGlobalStyle)
      oRm.write('><h1')
      oRm.writeAttributeEscaped('style', sLoadingStyle)
      oRm.write(`>${oControl.getTitle()}</h1>`)
      oRm.write('</div>')
    },
    onAfterRendering: function () {
      //No API Key : No Google Map
      if (!this.getKey()) {
        this._showError('No API Key')
        return
      }

      const sBaseUrl = `https://maps.googleapis.com/maps/api/js?key=${this.getKey()}&loading=async&libraries=marker`
      const fnInitialize = this._displayAdress.bind(this)
      const fnOnError = this._showError.bind(this)

      this._loadScript(sBaseUrl).then(fnInitialize).catch(fnOnError)
    },
    _loadScript: function (sUrl) {
      return new Promise(function (resolve, reject) {
        try {
          //Load only once
          if (google) {
            resolve()
          }
        } catch (e) {
          /**
           * If Google library was not loaded we have something like 'ReferenceError'
           * */
          if (e instanceof ReferenceError) {
            $.getScript(sUrl)
              .done(function (script, textStatus) {
                resolve()
              })
              .fail(function (jqxhr, settings, exception) {
                reject('Error while loading Google Maps')
              })
          }
        }
      })
    },
    _showError: function (sError) {
      console.error(sError)
      MessageBox.error(sError)
    },
    _displayAdress: function () {
      const sAdress = this.getAddress()

      const fnResolver = this._showMap.bind(this),
        fnError = this._showError.bind(this)

      //Promise to Search Address
      const oSearchAdress = new Promise((resolve, reject) => {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: sAdress }, (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {
            console.log(results)
            resolve(results)
            return
          }
          reject(`"<u>${sAdress}</u>" : Not Found`)
        })
      })

      //Launch Searching
      oSearchAdress.then(fnResolver).catch(fnError)
    },
    _getLatLong: function (sAddress) {
      const geocoder = new google.maps.Geocoder()

      return new Promise((resolve, reject) => {
        geocoder.geocode({ address: sAddress }, (results, status) => {
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
    _showMap: function (aResults) {
      const oDocument = this.getDomRef(),
        sMapType = this.getMapType(),
        iZoom = parseInt(this.getMapZoom()),
        sAdress = this.getAddress(),
        oLocation = aResults[0].geometry.location //Take the first Result for instance

      const mapOptions = {
        // center: oLocation,
        zoom: iZoom,
        mapTypeId: 'roadmap',
        fullscreenControl: true,
        mapId: 'MOBILITY_MAP',
      }

      this._directionsService = new google.maps.DirectionsService()
      this._directionsRenderer = new google.maps.DirectionsRenderer() // {suppressMarkers: true,preserveViewport:true}
      this._map = new google.maps.Map(oDocument, mapOptions)
      // this._map.setCenter(oLocation)
      window['mobilityMap'] = this._map
      this._directionsRenderer.setMap(this._map)

      // const marker = new google.maps.Marker({
      //   map: map,
      //   position: oLocation,
      //   title: sAdress,
      //   animation: google.maps.Animation.DROP,
      // })
      const origin = new google.maps.LatLng(33.51971, -86.814442)
      const destination = oLocation
      // map.setCenter(oLocation)
      this._getDirection(origin, destination)

      const oWorkOrdersAddressModel = this.getOwnerComponent().getModel('workOrdersAddressModel')
      const oAddressData = oWorkOrdersAddressModel.getData()

      oAddressData.forEach(({ orderID, fullAddress }, i) => {
        this._getLatLong(fullAddress)
          .then((coordinates) => {
            oAddressData[i].coordinates = coordinates
            console.log('Latitude:', coordinates.lat)
            console.log('Longitude:', coordinates.lng)
          })
          .catch((error) => {
            console.error('Error:', error)
          })
      })

      let marker
      const beachFlagImg = document.createElement('img')
      beachFlagImg.src =
        'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
      oCoordinatesData.forEach(({ coordinates, orderID }) => {
        marker = new google.maps.marker.AdvancedMarkerElement({
          content: beachFlagImg,
          position: coordinates,
          title: orderID,
          map: window['mobilityMap'],
        })
      })
    },

    _getDirection: async function (origin, destination) {
      try {
        const response = await this._directionsService.route({
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        })
        console.log(response)
        this._directionsRenderer.setDirections(response)
      } catch (error) {
        MessageBox.error('Directions request failed due to ' + error.message)
      }
    },
  })
})
