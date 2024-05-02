sap.ui.define(
  [
    'sap/ui/core/UIComponent',
    'sap/ui/Device',
    'mobility/model/models',
    'sap/ui/model/json/JSONModel',
    'sap/f/FlexibleColumnLayoutSemanticHelper',
    'sap/f/library',
  ],
  function (UIComponent, Device, models, JSONModel, FlexibleColumnLayoutSemanticHelper, fioriLibrary) {
    'use strict'

    return UIComponent.extend('mobility.Component', {
      metadata: {
        manifest: 'json',
      },
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments)

        const oModel = new JSONModel()
        this.setModel(oModel)

        // enable routing
        const oRouter = this.getRouter()
        oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this)
        oRouter.initialize()

        // set the device model
        this.setModel(models.createDeviceModel(), 'device')
      },

      getHelper: function () {
        return this._getFcl().then(function (oFCL) {
          const oSettings = {
            defaultTwoColumnLayoutType: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
            defaultThreeColumnLayoutType: fioriLibrary.LayoutType.ThreeColumnsMidExpanded,
            initialColumnsCount: 2,
            maxColumnsCount: 2,
          }
          return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings)
        })
      },

      _onBeforeRouteMatched: function (oEvent) {
        const oModel = this.getModel()
        const sLayout = oEvent.getParameters().arguments.layout
        let oNextUIState

        // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
        if (!sLayout) {
          this.getHelper().then(function (oHelper) {
            // console.log(oHelper)
            // console.log(oHelper.getNextUIState(0))
            // oNextUIState = oHelper.getNextUIState(0)
            oNextUIState = 'OneColumn'
            oModel.setProperty('/layout', oNextUIState)
          })
          return
        }

        oModel.setProperty('/layout', sLayout)
      },

      _getFcl: function () {
        return new Promise(
          function (resolve, reject) {
            const oFCL = this.getRootControl().byId('fcl')
            if (!oFCL) {
              this.getRootControl().attachAfterInit(function (oEvent) {
                resolve(oEvent.getSource().byId('fcl'))
              }, this)
              return
            }
            resolve(oFCL)
          }.bind(this)
        )
      },
    })
  }
)
