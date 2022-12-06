sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'riz.inno.tutorial.ui.adminapp',
            componentId: 'MaintNotificationObjectPage',
            entitySet: 'MaintNotification'
        },
        CustomPageDefinitions
    );
});