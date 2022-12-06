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
