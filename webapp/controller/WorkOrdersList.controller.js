// @ts-nocheck
sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict'

  return Controller.extend('mobility.controller.WorkOrdersList', {
    onInit: function () {
      this._oView = this.getView()
      // this._bDescendingSort = false
      // this.oProductsTable = this.oView.byId('productsTable')
      this._oRouter = this.getOwnerComponent().getRouter()

      this._oWorkorderListSet = this.getOwnerComponent().getModel('workOrderDetail')
      // this._oWorkorderListSet.attachRequestCompleted(function () {
      //   const data = this._oWorkorderListSet.getData()
      //   console.log('Data received:', data)
      // })

      // this._oWorkorderListSets = this.getOwnerComponent().getModel('workOrderDetail1')
      // this._oWorkorderListSets.read('/OrderListSet', {
      //   success: (data) => {
      //     console.log(data)
      //   },
      //   error: (err) => {
      //     console.error(err)
      //   },
      // })
    },
    onColumnListItemWOPress: function (oEvent) {
      const oSelectedObject = oEvent.getSource().getBindingContext('workOrderDetail').getObject()

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

    onDataReceived: function (oEvent) {
      console.log(oEvent)
      const oModel = oEvent.getSource().getModel()
      const data = oModel.oData
      console.log(oModel, data)

      const oWorkOrdersAddressData = []
      for (const key in data) {
        const order = data[key]
        const { Orderid, HouseNo, Street, City1, PostCode1, State, Country } = order
        const sFullAddress = `#${HouseNo}, ${Street}, ${City1}, ${PostCode1}, ${State}, ${Country}`
        oWorkOrdersAddressData.push({
          orderID: Orderid,
          fullAddress: sFullAddress,
        })
      }
      const oWorkOrdersAddressModel = this.getOwnerComponent().getModel('workOrdersAddressModel')
      oWorkOrdersAddressModel.setData(oWorkOrdersAddressData)
    },

    onAfterRendering: function () {
      const oWorkOrdersList = this.byId('idOrderList').getBinding('items')

      const oWorkOrdersAddressData = []
      setTimeout(() => {
        const oWorkOrdersModelData = this.getOwnerComponent().getModel('workOrderDetail')
        console.log(oWorkOrdersModelData)
        console.log(oWorkOrdersModelData.getData())
        oWorkOrdersList.attachEvent(
          'dataReceived',
          function (oEvent) {
            console.log(oEvent)
          }.bind(this)
        )
      }, 4500)
      // oWorkOrdersModelData.forEach((workorder) => {
      //   const { Orderid, HouseNo, Street, City1, PostCode1, State, Country } = workorder
      //   const sFullAddress = `#${HouseNo}, ${Street}, ${City1}, ${PostCode1}, ${State}, ${Country}`
      //   oWorkOrdersAddressData.push({
      //     orderID: Orderid,
      //     fullAddress: sFullAddress,
      //   })
      // })
      // const oWorkOrdersAddressModel = this.getOwnerComponent().getModel('workOrdersAddressModel')
      // oWorkOrdersAddressModel.setData(oWorkOrdersAddressData)
    },

    getPriorityText: function (sPriority) {
      let sPriorityText = ''
      switch (sPriority) {
        case '1':
          sPriorityText = 'Emergency'
          break
        case '2':
          sPriorityText = 'High'
          break
        case '3':
          sPriorityText = 'Medium'
          break
        case '4':
          sPriorityText = 'Low'
          break
        default:
          sPriorityText = 'No Priority'
          break
      }
      return sPriorityText
    },

    getPriorityIcon: function (sPriority) {
      let sPriorityIcon = ''
      switch (sPriority) {
        case '1':
          sPriorityIcon = 'sap-icon://error'
          break
        case '2':
          sPriorityIcon = 'sap-icon://alert'
          break
        case '3':
          sPriorityIcon = 'sap-icon://cancel'
          break
        case '4':
          sPriorityIcon = 'sap-icon://sys-help-2'
          break
        default:
          sPriorityIcon = 'sap-icon://sys-enter-2'
          break
      }
      return sPriorityIcon
    },

    getPriorityState: function (sPriority) {
      let sPriorityState = ''
      switch (sPriority) {
        case '1':
          sPriorityState = 'Error'
          break
        case '2':
          sPriorityState = 'Warning'
          break
        case '3':
          sPriorityState = 'Indication01'
          break
        case '4':
          sPriorityState = 'Information'
          break
        default:
          sPriorityState = 'Success'
          break
      }
      return sPriorityState
    },
  })
})
