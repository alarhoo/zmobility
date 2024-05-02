// @ts-nocheck
sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict'

  return Controller.extend('mobility.controller.WorkOrdersList', {
    onInit: function () {
      this._oView = this.getView()
      // this._bDescendingSort = false
      // this.oProductsTable = this.oView.byId('productsTable')
      this._oRouter = this.getOwnerComponent().getRouter()
    },
    onColumnListItemWOPress: function (oEvent) {
      const oSelectedObject = oEvent.getSource().getBindingContext('workorders').getObject()

      // const oDefaultModel = this.getOwnerComponent().getModel('defaultModel')
      // oDefaultModel.setProperty('/selectedWorkOrder', oSelectedObject)

      const { Orderid, OrderType } = oSelectedObject
      let oNextUIState
      if (!Orderid || !OrderType) {
        sap.m.MessageToast.show('Order ID or OrderType not found')
      } else {
        this.getOwnerComponent()
          .getHelper()
          .then(
            function (oHelper) {
              oNextUIState = oHelper.getNextUIState(1)
              this._oRouter.navTo('WorkOrdersDetail', {
                layout: oNextUIState.layout,
                orderId: Orderid,
                orderType: OrderType,
              })
            }.bind(this)
          )

        // this._oRouter.navTo('WorkOrdersDetail', {
        //   layout: 'TwoColumnsMidExpanded',
        //   orderId: Orderid,
        //   orderType: OrderType,
        // })
      }
    },

    onSearchFieldWOSearch: function (oEvent) {
      let oNextUIState
      this.getOwnerComponent()
        .getHelper()
        .then(
          function (oHelper) {
            oNextUIState = oHelper.getNextUIState(1)
            this._oRouter.navTo('WorkOrdersListMap', {
              layout: oNextUIState.layout,
              // orderId: Orderid,
              // orderType: OrderType,
            })
          }.bind(this)
        )
    },

    onAfterRendering: function () {
      const oWorkOrdersList = this.byId('idWorkOrdersTable')
      const oWorkOrdersAddressData = []
      const oWorkOrdersModelData = oWorkOrdersList.getModel('workorders').getData()
      oWorkOrdersModelData.forEach((workorder) => {
        const { Orderid, HouseNo, Street, City1, PostCode1, State, Country } = workorder
        const sFullAddress = `#${HouseNo}, ${Street}, ${City1}, ${PostCode1}, ${State}, ${Country}`
        oWorkOrdersAddressData.push({
          orderID: Orderid,
          fullAddress: sFullAddress,
        })
      })
      const oWorkOrdersAddressModel = this.getOwnerComponent().getModel('workOrdersAddressModel')
      oWorkOrdersAddressModel.setData(oWorkOrdersAddressData)
    },
  })
})
