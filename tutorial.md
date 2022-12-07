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
            nr                 : Integer @UI.ReadOnly;
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
        2. Nr field
            1. Add the following annotation to make the field read only
            ```cds
                   ![@Common.FieldControl] : #ReadOnly
            ```
5. in the original [data model](./db/notification.cds) add `@UI.MultiLineText` to the end of problemDescription.


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








## Cloud Foundry Deployment
1. Add the necessary CAP components via `cds add mta,hana,xsuaa,approuter`
2. Add the html5 deployment info
    1. Switch to directory `app/adminapp`
    2. Add the fior deployment configuration with command `fiori add deploy-config`
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
6. Add the following to the `manifest.json` file
    ```json
    "sap.cloud": {

      "public": true,

      "service": "riz.inno.tutorial.ui"

    }
    ```
7. Add the following section to the destination service in the mta.yaml
    ```yaml
          - Authentication: NoAuthentication
            HTML5.ForwardAuthToken: true
            Name: cds-customer-stepbystep-srv-api
            ProxyType: Internet
            Type: HTTP
            URL: ~{srv-api/srv-url}
    ```
8. Make sure that you update the 'xs-app.json' in the app/adminapp directory with the following content. The name in the previous step must match the destination name in this app router configuration. 
    ```json
    {
      "source": "^/admin/(.*)$",
      "target": "/admin/$1",
      "destination": "cds-customer-stepbystep-srv-api",
      "authenticationType": "xsuaa",
      "csrfProtection": false
    }
    ```
