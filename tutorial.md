# Step-by-step Tutorial

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
            nr                 : Integer;
            problemDescription : String(500);
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



