# Integration with on-premise S/4 system











## Detailed approach
1. Download the edmx meta data from api.sap.com
    1. Go to https://api.sap.com/api/OP_API_MAINTNOTIFICATION/overview
    2. Click on the 'API Specification' button
    3. Download the edmx file
    4. Make sure cds watch is running and drag and drop the file into the root directory of the project
        - alternatively you can use the `cds import` command
        - ! Explain that the a) edmx is converted into .csn format and stored in the directory and b) it is referenced in package json
    5. Optional: To make this service definition now available through the standard CAP mechanism, you can do the following: 
        1. As the service is now automatically mocked, you can access it via
        ```http
        GET http://localhost:4004/op-api-maintnotification/MaintenanceNotification HTTP/1.1
        ```
        
        2. As an alternative or in addition you can explicitly expose an entity by 
            1. adding the following lines to ./srv/admin.cds
            ```cds
            using {OP_API_MAINTNOTIFICATION as notifpackage} from './external/OP_API_MAINTNOTIFICATION.csn';

            service AdminService {

                entity sapMaintNotif as projection on notifpackage.MaintenanceNotification;
            }
            ```
            2. Now you can test the access by performing a GET 
            ```http
            GET http://localhost:4004/admin/sapMaintNotif HTTP/1.1
            ```
        3. In order to test it with some data, you can provide a data set in the file
            1. Create a directory in the srv/external directory with the name 'data' (you can also put the file into the 'db/data' directory)
            2. Create a file with the name 'OP_API_MAINTNOTIFICATION.MaintenanceNotification.csv'
            3. Add the following content:
            ```csv
            MaintenanceNotification,MaintNotifInternalID,NotificationText
            120132,bla,This is a notification text
            102213,bl1,Another notification
            ```
    6. Install the necessary packages
        1. SAP Cloud SDK Core `npm install @sap-cloud-sdk/http-client @sap-cloud-sdk/util`

    7. To create production and test setups
        1. In the `package.json` file add this 
        ```json
        "OP_API_MAINTNOTIFICATION": {
        "kind": "odata-v2",
        "model": "srv/external/OP_API_MAINTNOTIFICATION",
        "credentials": {
                        "destination": "ehs-api-service",
                        "path":"/sap/opu/odata/sap/API_MAINTNOTIFICATION"
                    }
        }
        ```
        to the `[production]` profile section so that the cds branch looks as follows:
        ```json
        "cds": {
            "requires": {
            "[production]": {
                "auth": {
                "kind": "xsuaa"
                },
                "db": {
                "kind": "hana-cloud"
                },
                "OP_API_MAINTNOTIFICATION": {
                "kind": "odata-v2",
                "csrf": true,
                "model": "srv/external/OP_API_MAINTNOTIFICATION",
                "credentials": {
                                "destination": "ehs-api-service",
                                "path":"/sap/opu/odata/sap/API_MAINTNOTIFICATION"
                            }
                }
            },
            "db": {
                "kind": "sql"
            },
            "OP_API_MAINTNOTIFICATION": {
                "kind": "odata-v2",
                "csrf": true,
                "model": "srv/external/OP_API_MAINTNOTIFICATION"
            }
            }
        }
        ```
        That section indicates the user of the destination defined in the sub account.

        2. To override the credentials, you can create a `.cdsrc-private.json` file in the root directory of the project. This specific one creates a configuration called 'hybrid'. You can use the configuration by starting CAP with `cds watch --profile hybrid`
        ```json
        {
            "requires": {
                "[hybrid]": {
                    "OP_API_MAINTNOTIFICATION": {
                        "kind": "odata-v2",
                        "csrf": true,
                        "model": "srv/external/OP_API_MAINTNOTIFICATION",
                        "credentials": {
                            "url": "https://[mys4systemhost]/sap/opu/odata/sap/API_MAINTNOTIFICATION",
                            "username": "<username>",
                            "password": "<password>"
                        }
                    }
                }
            }
       ```

       3. As the Backend Service call now uses the Destination Service and the Destination Service itself uses the Cloud Connector to connect to an on-premise system, we need to add those two services into the mix in the `mta.yaml` deployment file definition.
            1. The destination service was already defined before as the UI is using it so we don't have to create a defintion for it.
            2. The connectivity service representing the Cloud Connector connection needs to be added to the `resources:` section of `mta.yaml'
            ```yaml
            - name: cds-customer-stepbystep-connectivity
              type: org.cloudfoundry.managed-service
              parameters:
                service: connectivity
                service-plan: lite
            ```
            3. Both services need to be referenced from the nodejs microservice. The revised section should look like this:
            ```yaml
            - name: cds-customer-stepbystep-srv
              type: nodejs
              path: gen/srv
              requires:
              - name: cds-customer-stepbystep-auth
              - name: cds-customer-stepbystep-db
              - name: cds-customer-stepbystep-destination-service
              - name: cds-customer-stepbystep-connectivity
              provides:
              - name: srv-api
                properties:
                srv-url: ${default-url}
              parameters:
                buildpack: nodejs_buildpack
              build-parameters:
                builder: npm-ci
            ```




    8. To execute the call we have to implement a simple code snipped. Create a file in the `srv` directory called `admin.js` (name should match your cds filename you used for the service definition)
    ```js
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

            // ensure to call super.init()
            await super.init();
        }
    }
    module.exports = AdminService;
    ```

    9. If you test the following again, you should receive a list of maintenance notifications from your SAP system
        ```http
        GET http://localhost:4004/admin/sapMaintNotif HTTP/1.1
        ```    

    9. Add the following handler to the AdminService. **!!! Insure you have set the following `cds.env.features.fetch_csrf = true` for all calls to SAP backend systems !!!**
    ```js
     // Handler to happen before the creation of a record
    this.before("CREATE", 'MaintNotification', async (req) => {

        if (process.env.NODE_ENV == 'production') {

            // Assign and adjust data 
            let dataBlock = {}
            dataBlock.NotificationType = '11'
            dataBlock.NotificationText = req.data.problemDescription

            // Assemble CAP query
            let insertQuery = INSERT.into('MaintenanceNotification', [dataBlock])

            // Execute query against backend system
            let insResult = await eam.tx(req).run(insertQuery)

            // Add the notificiation number to the storage in DB
            req.data.nr = insResult.MaintenanceNotification

        } else {
            console.log('SAP Create Notification is NOT triggers as profile is:', process.env.NODE_ENV)
        }


        return req
    });

    ```
