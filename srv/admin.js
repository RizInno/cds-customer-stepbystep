const cds = require("@sap/cds");

/**
 * Class defintion for AdminService
 */
class AdminService extends cds.ApplicationService {
    async init() {

        // connect to backend service 
        const eam = await cds.connect.to("OP_API_MAINTNOTIFICATION");

        // Read handler
        this.on(["READ"], "sapMaintNotif", async (req) => {

            //console.log(cds.env)
            return await eam.tx(req).run(req.query);

        });

        // Handler to happen before the creation of a record
        this.before("CREATE", 'MaintNotification', async (req) => {

            if (process.env.NODE_ENV == 'production') {

                console.log('Setting CSRF, currently:', cds.env.features.fetch_csrf)
                cds.env.features.fetch_csrf = true

                // Assign and adjust data 
                let dataBlock = {}
                dataBlock.NotificationType = '11'
                dataBlock.NotificationText = req.data.problemDescription

                let selResult = await eam.run(SELECT.from('MaintenanceNotification').limit(1))

                console.log('SELECT RESULTS:', selResult)

                // Assemble CAP query
                let insertQuery = INSERT.into('MaintenanceNotification', [dataBlock])

                // Execute query against backend system
                let insResult = await eam.tx(req).run(insertQuery)

                // SAP result output
                console.log('SAP Result:', insResult)

                // Add the notificiation number to the storage in DB
                req.data.nr = insResult.MaintenanceNotification

                // Output of result data structure
                console.log('.data:', req.data)


            } else {
                console.log('SAP Create Notification is NOT triggers as profile is:', process.env.NODE_ENV)
            }


            return req
        });


        // ensure to call super.init()
        await super.init();
    }
}
module.exports = AdminService;