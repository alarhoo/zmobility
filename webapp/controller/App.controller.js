// @ts-nocheck
sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict'

  return Controller.extend('mobility.controller.App', {
    onInit: function () {
      this.oOwnerComponent = this.getOwnerComponent()
      this.oRouter = this.oOwnerComponent.getRouter()
      this.oRouter.attachRouteMatched(this.onRouteMatched, this)
    },

    onRouteMatched: function (oEvent) {
      const sRouteName = oEvent.getParameter('name')
      const oArguments = oEvent.getParameter('arguments')

      // Save the current route name
      this.currentRouteName = sRouteName
      this.currentOrder = oArguments.Orderid
    },

    onStateChanged: function (oEvent) {
      const bIsNavigationArrow = oEvent.getParameter('isNavigationArrow')
      const sLayout = oEvent.getParameter('layout')

      this._updateUIElements()
      // Replace the URL with the new layout if a navigation arrow was used
      if (bIsNavigationArrow) {
        this.oRouter.navTo(this.currentRouteName, { layout: sLayout, orderId: this.currentOrder }, true)
      }
    },
    // Update the close/fullscreen buttons visibility
    _updateUIElements: function () {
      const oModel = this.oOwnerComponent.getModel()
      let oUIState
      this.oOwnerComponent.getHelper().then(function (oHelper) {
        oUIState = oHelper.getCurrentUIState()
        oModel.setData(oUIState)
      })
    },

    onExit: function () {
      this.oRouter.detachRouteMatched(this.onRouteMatched, this)
    },

    // onAfterRendering: function () {
    //   // Load Google Maps API asynchronously
    //   const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBGpkS0o9Y6et0Ic1SIUhVTQfocI9rzlM8&callback=initGoogleMaps&loading=async&libraries=marker`
    //   const script = document.createElement('script')
    //   script.src = scriptUrl
    //   script.defer = true
    //   script.async = true

    //   window.initGoogleMaps = this._initializeMap.bind(this)

    //   script.onerror = () => {
    //     this._showError('Error loading Google Maps.')
    //   }

    //   document.head.appendChild(script)
    // },
    // onAfterRendering: function () {

    //   const sBaseUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBGpkS0o9Y6et0Ic1SIUhVTQfocI9rzlM8&libraries=marker` // &loading=async
    //   const fnInitialize = this._showMap.bind(this)
    //   const fnOnError = this._showError.bind(this)

    //   this._loadScript(sBaseUrl).then(fnInitialize).catch(fnOnError)
    // },
    // _loadScript: function (sUrl) {
    //   return new Promise(function (resolve, reject) {
    //     try {
    //       //Load only once
    //       if (google) {
    //         resolve()
    //       }
    //     } catch (e) {
    //       /**
    //        * If Google library was not loaded we have something like 'ReferenceError'
    //        * */
    //       if (e instanceof ReferenceError) {
    //         $.getScript(sUrl)
    //           .done(function (script, textStatus) {
    //             console.log(script, textStatus)
    //             resolve()
    //           })
    //           .fail(function (jqxhr, settings, exception) {
    //             reject('Error while loading Google Maps')
    //           })
    //       }
    //     }
    //   })
    // },
    _showError: function (sError) {
      console.error(sError)
      MessageBox.error(sError)
    },

    _initializeMap: function () {
      console.log(google.maps)
      window['mobilityMap'] = google.maps
      // const oDocument = this.getDomRef(),
      //   sMapType = this.getMapType(),
      //   iZoom = parseInt(this.getMapZoom()),
      //   sAdress = this.getAddress(),
      //   oLocation = { lat: 33.51978153002461, lng: -86.81422742690333 }

      // const mapOptions = {
      //   center: oLocation,
      //   zoom: iZoom,
      //   mapTypeId: 'roadmap',
      //   fullscreenControl: true,
      //   mapId: 'MOBILITY_MAP',
      // }

      // this._map = new google.maps.Map(oDocument, mapOptions)
      // window['mobilityMap'] = this._map
    },
  })
})
