sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'riz/inno/tutorial/ui/adminapp/test/integration/FirstJourney',
		'riz/inno/tutorial/ui/adminapp/test/integration/pages/MaintNotificationList',
		'riz/inno/tutorial/ui/adminapp/test/integration/pages/MaintNotificationObjectPage'
    ],
    function(JourneyRunner, opaJourney, MaintNotificationList, MaintNotificationObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('riz/inno/tutorial/ui/adminapp') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMaintNotificationList: MaintNotificationList,
					onTheMaintNotificationObjectPage: MaintNotificationObjectPage
                }
            },
            opaJourney.run
        );
    }
);