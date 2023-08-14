# Fiori Elements User Inferface
Now let's add a user interface to it. 

1. Use the Fiori Extension to create the necessary Fiori Application artifacts 
    1. Run the Fiori Aplication Generation to create the basic framework 
        1. Go to the Command Pallette (In BAS or VSCode follow menu path View/Commmand Palette) and look for `Fiori: Open Application Generator`
            - As alternative you can you the shortcut `Ctrl+Shift+P` (Windows) or `Command+Shift+P` (Mac) and type `Fiori: Open Application Generator`
        2. In the first screen (Template Selection) select `List Report Page` and click [Next]
        3. In the second screen (Data Source Selection) 
            1. select `Use a Local CAP Project` and 
            2. select [Select current directory, usually the first entry in the list] and
            3. Once you have selected the CAP project, select the OData service `AdminService (Node.js)` and click [Next]
            4. click [Next] 
        4. In the third screen (Entity Selection) select `MaintNotification` and click [Next]
            - Leave the default values (Automatically add table columns to the list page and a section to the object page if none already exist?) for the other fields
        5. In the fourth screen (Project Attributes) specify the following
            - **Module Name :** adminapp !!! This is used to create the directory name and the app identifier !!!
            - **Application Title:** Maintenance Notifications
            - **Application Namespace:** riz.inno.tutorial.ui
            - **Description:** [leave default value (A Fiori application)]
            - **Add FLP Configuration:** [Switch to Yes]
            - **Configure advanced options:** [leave default value (No)] 
        6. Because you switched on the FLP configuration in the previous step, you will be asked to specify the semantic object and action. 
            - **Semantic Object:** custMaintNotif
            - **Action:** manage
            - **Title:** Custom Maintenance Notifications
            - **SubTitle:** manage

2. This should have created and changed about 20 or so files 
3. start the cap stack with `cds watch`
4. open the app in the browser with `http://localhost:4004/adminapp/webapp/index.html`. You will see a few shortcomings:
    - The create button is not visible
    - The create and modify date fields are visible
5. To fix the create button issue let's we have to enable the odata.draft. To do so: 
    1. find and open the file annotations.cds in the folder `app/adminapp`
    2. after the first line 'using AdminService...' insert another line 
        ```cds
        annotate service.MaintenanceNotifications with @(odata.draft.enabled:true);
        ```
        That allows the create button to become visible.
    3. Once the CAP stack has restarted, refresh the browser and you will see the create button.
6. To get rid of the create and modify date fields, we have to adjust the annotations.cds file. 
    1. In the line item section
        1. Delete the create and modify date fields
7. While we are at it let's also change the labels for the fields in the annotation.cds file
    1. In the line item section
        2. Change the label for nr to 'Nr'
        3. Change the label for problemDescription to 'Problem Description'
    2. In the UI.FieldGroup section
        1. Change the labels to something that makes more sense to you.
8. We still have the problem that the S/4 ID - that later is filled automatically is still showing up as editable field. Let's fix that.
    1. Go back to the annotations.cds file and add the following annotation to the S/4 ID field
        ```cds
                ![@Common.FieldControl] : #ReadOnly
        ```

**Good Job, you have created a Fiori Elements UI for your CAP service.**

[back to the Tutorial Overview](./tutorial.md)