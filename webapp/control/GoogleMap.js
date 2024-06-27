// @ts-nocheck
sap.ui.define(
  ['sap/ui/core/Control', 'sap/m/MessageBox', 'sap/ui/core/Fragment', 'sap/ui/model/json/JSONModel'],
  function (Control, MessageBox, Fragment, JSONModel) {
    'use strict'
    return Control.extend('mobility.control.GoogleMap', {
      metadata: {
        aggregations: {
          _content: {
            type: 'sap.ui.core.Control',
            visibility: 'hidden',
          },
        },
        properties: {
          address: {
            type: 'string',
            // defaultValue: 'Birmingham, Alabama USA',
          },
          defaultAdress: 'string',
          title: {
            type: 'string',
            defaultValue: 'Loading...',
          },
          description: 'string',
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
          setRoute: {
            type: 'boolean',
            defaultValue: true,
          },
        },
      },
      init: function () {
        if (!this._map) {
          this._loadView()
          this._controlModel = new JSONModel({})
          this.setModel(this._controlModel, 'control')
          this._controlModel.setProperty('/directionText', 'Lisa Ann')
        }
        // this.fireReady({ control: this })
      },
      renderer: {
        apiVersion: 2,
        render: function (oRm, oControl) {
          const sGlobalStyle = `width:${oControl.getWidth()};height:${oControl.getHeight()};background:${oControl.getBackgroundColor()}`
          const sLoadingStyle = `color:#A09494;text-align:center;font-size:1rem;padding-top:2rem`

          // oRm.write('<div')
          // oRm.writeControlData(oControl)
          // oRm.writeAttributeEscaped('style', sGlobalStyle)
          // oRm.write('>')
          // oRm.write('<h1')
          // oRm.writeAttributeEscaped('style', sLoadingStyle)
          // oRm.write(`>${oControl.getTitle()}</h1>`)

          oRm.openStart('div', oControl).openEnd()
          const content = oControl.getAggregation('_content') || []

          window['mapContainer'] = oControl.getAggregation('_content')[0]
          console.log(window['mapContainer'])
          window['mapContainer'].setHeight(oControl.getHeight())
          window['mapContainer'].setWidth(oControl.getWidth())
          window['mapContainer'].addStyleClass('mapContainer')

          content.forEach((control) => {
            oRm.renderControl(control)
          })
          console.log(window['mapContainer'].getDomRef())
          oRm.close()
        },
      },
      onAfterRendering: function () {
        this._initializeMap()
      },
      _showError: function (sError) {
        console.error(sError)
        MessageBox.error(sError)
      },

      _loadView: async function () {
        let content = await Fragment.load({
          name: 'mobility.control.GoogleMap',
          controller: this,
        })
        content = Array.isArray(content) ? content : [content]
        content.forEach((control) => this.addAggregation('_content', control))
      },
      _initializeMap: async function () {
        const oDocument = window['mapContainer'].getDomRef(), // sap.ui.getCore().byId('idGoogleMapHBox').getDomRef(), //this.getDomRef(),
          bSetRoute = this.getSetRoute(),
          iZoom = parseInt(this.getMapZoom()),
          sAddress = this.getAddress(),
          oLocation = { lat: 33.51978153002461, lng: -86.81422742690333 }

        const mapOptions = {
          center: oLocation,
          zoom: iZoom,
          mapTypeId: 'roadmap',
          fullscreenControl: true,
          mapId: 'MOBILITY_MAP',
        }

        const { Map } = await google.maps.importLibrary('maps')

        this._map = new Map(oDocument, mapOptions)
        window['mobilityMap'] = this._map

        // if an address is passed, a marker is displayed; and if setRoute is true, direction is shown

        if (sAddress) {
          this._showMarker(sAddress)
        }
        if (bSetRoute) {
          const latLng = this._getLatLng(sAddress)
            .then((coordinates) => {
              this._getDirection(oLocation, coordinates)
              this._controlModel.setProperty('/directionText', `From Gernin to ${sAddress}`)
            })
            .catch((error) => {
              console.error('Error:', error)
              this._showError(error)
            })
        }
      },

      _showMarker: async function (sAddress) {
        const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')
        this._getLatLng(sAddress)
          .then((coordinates) => {
            console.log(coordinates)
            const beachFlagImg = document.createElement('img')
            beachFlagImg.src =
              'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
            new AdvancedMarkerElement({
              content: beachFlagImg,
              map: this._map,
              position: coordinates,
              title: sAddress,
            })
            this._map.setCenter(coordinates)
            this._controlModel.setProperty('/directionText', sAddress)
          })
          .catch((error) => {
            console.error('Error:', error)
            this._showError(error)
          })
      },

      _getLatLng: async function (sAddress) {
        const { Geocoder } = await google.maps.importLibrary('geocoding')

        const geocoder = new Geocoder()

        return new Promise((resolve, reject) => {
          geocoder.geocode({ address: sAddress }, (results, status) => {
            if (status === 'OK' && results.length > 0) {
              const location = results[0].geometry.location
              const lat = location.lat()
              const lng = location.lng()
              // console.log('Latitude:', location.lat())
              // console.log('Longitude:', location.lng())
              resolve({ lat, lng })
            } else {
              reject('Geocode was not successful for the following reason: ' + status)
            }
          })
        })
      },

      _getDirection: async function (origin, destination) {
        const directionsService = new google.maps.DirectionsService()
        const directionsRenderer = new google.maps.DirectionsRenderer()
        try {
          const response = await directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
          })
          console.log(response)
          directionsRenderer.setDirections(response)
          directionsRenderer.setMap(this._map)
          // this._controlModel.setProperty('/directionText', sAddress)
        } catch (error) {
          MessageBox.error('Directions request failed due to ' + error.message)
        }
      },
    })
  }
)
