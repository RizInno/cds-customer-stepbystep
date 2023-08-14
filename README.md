# SAP CAP Customer Step By Step Tutorial 

This Tutorial provides a quick step by step guide to create a simple SAP CAP (Node.js) based app. This app will collect the necessary information for a SAP Maintenance Notification from a customer and store it in a HANA Cloud database. Subsequent to storing it in the HANA table it will create a matching record in the associated SAP system. 

Step-by-step instructions are provided in the [tutorial](./doc/tutorial.md) file.

# Pre-requisites
## Installation on developer machine
1. Install Node.js (https://nodejs.org/en/download/) 
    - Node.js version 14 or 16 is recommended
2. Install VS Code (https://code.visualstudio.com/download) or any other IDE of your choice
    - Install REST Client extension
3. Install Cloud Foundry CLI (https://docs.cloudfoundry.org/cf-cli/install-go-cli.html)
    - Install MultiApps CF CLI Plugin
4. Install Cloud MTA Build Tool (https://sap.github.io/cloud-mta-build-tool/)
    - use command `npm install -g mbt`
5. Install SAP Cloud Application Programming Model (CAP) CLI (https://cap.cloud.sap/docs/get-started/)
    - use command `npm install -g @sap/cds-dk`
5. Install Fiori Tools
    - use command `npm -g i @sap/ux-ui5-tooling`
    - use command `npm -g i yo`
    - use command `npm install -g @sap/generator-fiori`
    - use command `npm install -g mta`

## Installation on SAP BTP account
1. Create a SAP Sub Account
2. Assign the necessary entitilements
    - Application Runtime
    - Connectivity
    - HANA Cloud
    - Destination
2. Create a Cloud Foundry Space
3. Create a HANA Cloud Instance
4. Configure the Cloud Connector to connect to an on-premise SAP S/4 system 




