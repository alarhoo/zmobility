// @ts-nocheck
sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict'

  return Controller.extend('mobility.controller.WorkOrdersDetail', {
    onInit: function () {
      // const oWorkOrdersModel = this.getOwnerComponent().getModel('workorders')
      // console.log(oWorkOrdersModel)
      this._oOwnerComponent = this.getOwnerComponent()

      this._oRouter = this._oOwnerComponent.getRouter()
      this._oModel = this._oOwnerComponent.getModel()

      this._oRouter.getRoute('WorkOrdersList').attachPatternMatched(this._onWorkOrderMatched, this)
      this._oRouter.getRoute('WorkOrdersDetail').attachPatternMatched(this._onWorkOrderMatched, this)
      // this._oRouter.getRoute('WorkOrdersDetailDetail').attachPatternMatched(this._onWorkOrderMatched, this)
    },

    _onWorkOrderMatched: function (oEvent) {
      const oView = this.getView()
      this._orderId = oEvent.getParameter('arguments').orderId || this._orderId || '0'
      this._orderType = oEvent.getParameter('arguments').orderType || this._orderType || '0'
      const sPath = `/OrderListSet(Orderid='${this._orderId}',OrderType='${this._orderType}')`
      this.getView().bindElement({
        path: sPath,
        model: 'workOrderDetail',
        events: {
          dataRequested: () => {
            oView.setBusy(true)
          },
          dataReceived: () => {
            oView.setBusy(false)
          },
        },
      })

      const oMeterReadSummaryTable = this.byId('idMeterReadSummaryTable')
      const oMeterSummaryModel = new sap.ui.model.json.JSONModel()
      oMeterReadSummaryTable.setModel(oMeterSummaryModel, 'meterSummaryModel')
      const oWOModel = this.getOwnerComponent().getModel('workOrderDetail')
      oWOModel.read(sPath + '/ServiceOrderSet', {
        success: (data, res) => {
          oMeterSummaryModel.setData(data.results)
        },
        error: (err) => {
          console.error(err)
        },
      })
      // failed because there is no unique keys in the response (OData design issue)
      // const oTemplate = this.byId('idMeterTableColumnListItem')
      // console.log(oMeterReadSummaryTable)
      // oMeterReadSummaryTable.bindItems({
      //   path: `workOrderDetail>/${sPath}/ServiceOrderSet`,
      //   template: oTemplate,
      // })
      // console.log(oMeterReadSummaryTable.getModel().getData())
      // console.log(oMeterReadSummaryTable.getModel('workOrderDetail'))

      // new way

      // const oDefaultModel = this.getOwnerComponent().getModel('defaultModel')
      // const oSelectedObject = oDefaultModel.getProperty('/selectedWorkOrder')
      // console.log(oSelectedObject)
      // this.getView().setModel(oDefaultModel, 'wo')
      // // console.log(this.getView().getModel(), this.getView().getModel('wo'))
    },

    onEditToggleButtonPress: function () {
      var oObjectPage = this.getView().byId('ObjectPageLayout'),
        bCurrentShowFooterState = oObjectPage.getShowFooter()

      oObjectPage.setShowFooter(!bCurrentShowFooterState)
    },

    handleFullScreen: function () {
      var sNextLayout = this._oModel.getProperty('/actionButtonsInfo/midColumn/fullScreen')
      // WorkOrder/{orderType}/{orderId}/{layout}
      this._oRouter.navTo('WorkOrdersDetail', {
        layout: sNextLayout,
        orderType: this._orderType,
        orderId: this._orderId,
      })
    },

    handleExitFullScreen: function () {
      var sNextLayout = this._oModel.getProperty('/actionButtonsInfo/midColumn/exitFullScreen')
      this._oRouter.navTo('WorkOrdersDetail', {
        layout: sNextLayout,
        orderType: this._orderType,
        orderId: this._orderId,
      })
    },

    handleClose: function () {
      var sNextLayout = this._oModel.getProperty('/actionButtonsInfo/midColumn/closeColumn')
      this._oRouter.navTo('WorkOrdersList', { layout: sNextLayout })
    },

    onExit: function () {
      this._oRouter.getRoute('WorkOrdersList').detachPatternMatched(this._onWorkOrderMatched, this)
      this._oRouter.getRoute('WorkOrdersDetail').detachPatternMatched(this._onWorkOrderMatched, this)
    },

    onAfterRendering: function () {
      // this.initiateMap()
    },
  })
})
