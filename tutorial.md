# Step-by-step Tutorial


## The foundation

1. Create a new Github repository
2. Clone the empty repository to your local machine
3. Open the repository in VS Code
4. Create a new CAP project
    - Open Terminal
    - Execute command `cds init`
5. Define the initial data model
    - Open `db/notification.cds`
    - Add the following content:
    ```cds
    namespace riz.inno.tutorial;

    /**
    * Type definitions for the tutorial application
    */
    type User : String(255);


    /**
    * Entity definitions for the tutorial application
    */
    entity MaintNotification {
        key ID                 : UUID;
            nr                 : String(20);
            problemDescription : String(500) @UI.MultiLineText;
            createdAt          : Timestamp  @cds.on.insert : $now;
            createdBy          : User       @cds.on.insert : $user;
            modifiedAt         : Timestamp  @cds.on.insert : $now   @cds.on.update : $now;
            modifiedBy         : User       @cds.on.insert : $user  @cds.on.update : $user;
    }

    ```
6. Define the simple service definition that makes the entity available for read and write
    - Open `srv/admin.cds`
    - Add the following content:
    ```cds
    using { riz.inno.tutorial as my } from '../db/notification';

    service AdminService {

        entity MaintNotification as projection on my.MaintNotification;
    }
    ```
7. Testing the service
    1. Create new sub folder `test`
    2. Create new file `test/admin.http'
    3. Add the following content:
    ```http
    ### Returns a list of all maintenance notifications
    GET http://localhost:4004/admin/MaintNotification HTTP/1.1

    ### Create a new maintenance notification
    POST http://localhost:4004/admin/MaintNotification HTTP/1.1
    Content-Type: application/json

    {
        "problemDescription": "Transformer for customer exploded"
    }
    ```

## User Inferface
Now let's add a user interface to it. 

1. Use the Fiori Extension 
    - Add Fiori Launchpad Configuration
        - Add Fiori Launchpad Configuration: Command Pallette/Fiori: Open Application Generator
        - **Application Type:** SAP Fiori elements
        - **Template:** List Report Page
        - [Next]
        - **Data source:** Use a Local CAP Project
        - **CAP Projec Folder path:** [Select current directory]
        - **OData Service:** AdminService (Node.js)
        - [Next]
        - **Main Entity:** MaintNotification
        - [Next]
        - **Module Name :** adminapp !!! This is used to create the directory name and the app identifier !!!
        - **Application Title:** Maintenance Notifications
        - **Application Namespace:** riz.inno.tutorial.ui
        - **Add FLP Configuration:** [Switch to TRUE] 
         [Next]
        - **Semantic Object:** custMaintNotif
        - **Action:** manage
        - **Title:** Custom Maintenance Notifications
        - **SubTitle:** manage

2. start the app with `cds watch`
3. open the app in the browser with `http://localhost:4004/adminapp/webapp/index.html`. You will see a few shortcomings:
    - The create button is not visible
    - The problem description field is not multi line
    - The nr field is editable
    - The create and modify date fields are visible


4. In annotations.cds let's make the following adjustments

    1. In the line item section
        1. Delete the create and modify date fields
        2. Change the label for nr to 'Nr'
        3. Change the label for problemDescription to 'Problem Description'

    2. In the header section
        1. after the line 'annotate service.MaintNotification with @(' insert another line 
        ```cds
        odata.draft.enabled : true,
        ```
        That allows the create button to become visible.

        2. Change the Nr field to read only by adding the following annotation to make the field read only
        ```cds
                ![@Common.FieldControl] : #ReadOnly
        ```


5. in the original [data model](./db/notification.cds) add `@UI.MultiLineText` to the end of problemDescription.




## Cloud Foundry Deployment
1. Add the necessary CAP components via `cds add mta,hana,xsuaa --for production`
2. Add the html5 deployment info
    1. Switch to directory `app/adminapp`
    2. Add the Fiori deployment configuration with command `fiori add deploy-config`
        - **Destination:** cds-customer-stepbystep-srv-api
    3. Change back to the root directory
3. run the packaging command `mbt build`
4. deploy the app with `cf deploy ./mta_archives/cds-customer-stepbystep_1.0.0.mtar`
5. In the mta.yaml adjust the following line in the `mta.yaml` file
    ```yaml
    HTML5Runtime_enabled: false
    ```
    to
    ```yaml
    HTML5Runtime_enabled: true
    ```
6. Add the following to the `manifest.json` file
    ```json
    "sap.cloud": {

      "public": true,

      "service": "riz.inno.tutorial.ui"

    }
    ```
7. Make sure that you update the `xs-app.json` in the app/adminapp directory with the following content. The name in the previous step must match the destination name in this app router configuration. 
    ```json
    {
      "source": "^/admin/(.*)$",
      "target": "/admin/$1",
      "destination": "cds-customer-stepbystep-srv-api",
      "authenticationType": "xsuaa",
      "csrfProtection": false
    }
    ```
8. Limit the amount of consumed memory and disk space for the service. In `mta.yaml` specify the parameters:
    ```yaml
          memory: 256M
          disk-quota: 512M

8. Add a UI Content deployer step in the `mta.yaml` file
    ```yaml
    - name: cds-customer-stepbystep-ui-deployer
    type: com.sap.application.content
    path: .
    build-parameters:
        build-result: resources
        requires:
        - name: rizinnotutorialuiadminapp
            artifacts:
            - rizinnotutorialuiadminapp.zip
            target-path: resources/
    ```

9. Add the destination deployer step in the `mta.yaml` file. This is a monster and requires ties to the a) xsuaa service b) your microsservice containing the business logic and c) the repo host. The last of the three is even more complicated as the standard generator changes the service name (cds-customer-stepbystep-html5-srv) to be different than the mta name (cds-customer-stepbystep-repo-host). 
    ```yaml
    - name: cds-customer-stepbystep-destination-deployer
    type: com.sap.application.content
    parameters:
        content:
        instance:
            destinations:
            - Authentication: OAuth2UserTokenExchange
                Name: cds-customer-stepbystep-srv-api
                TokenServiceInstanceName: cds-customer-stepbystep-auth
                TokenServiceKeyName: cds-customer-stepbystep-auth-key
                URL: ~{srv-api/srv-url}
                sap.cloud.service: riz.inno.tutorial.ui
            - Name: cds-customer-stepbystep-repo-host
                ServiceInstanceName: cds-customer-stepbystep-html5-srv
                ServiceKeyName: cds-customer-stepbystep-html5-srv-key
                sap.cloud.service: riz.inno.tutorial.ui
            - Authentication: OAuth2UserTokenExchange
                Name: cds-customer-stepbystep-auth
                ServiceInstanceName: cds-customer-stepbystep-auth
                ServiceKeyName: cds-customer-stepbystep-auth-key
                sap.cloud.service: riz.inno.tutorial.ui
            existing_destinations_policy: update
    build-parameters:
        no-source: true
    requires:
        - name: cds-customer-stepbystep-auth
        parameters:
            service-key:
            name: cds-customer-stepbystep-auth-key
        - name: cds-customer-stepbystep-repo-host
        parameters:
            service-key:
            name: cds-customer-stepbystep-html5-srv-key
        - name: srv-api
        - name: cds-customer-stepbystep-destination-service
        parameters:
            content-target: true
            service-key:
            name: cds-customer-stepbystep-destination-service-key

    ```

## Addition of backend call to S/4 HANA
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

            console.log('Setting CSRF, currently:', cds.env.features.fetch_csrf)
            cds.env.features.fetch_csrf = true

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
