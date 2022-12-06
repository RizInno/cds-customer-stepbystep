sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'riz.inno.tutorial.ui.adminapp',
            componentId: 'MaintNotificationList',
            entitySet: 'MaintNotification'
        },
        CustomPageDefinitions
    );
});