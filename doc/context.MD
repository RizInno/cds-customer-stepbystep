# Business Request
- The University Maintenance Department requests an application to easily enter facility problems. 
- The application should store the problems in a database and immediately create a maintenance notification in SAP to start the SAP Maintenance process.

# Fundamental Assumptions
1. I have the necessary BTP entitlements or respective Cloud Credits to run the application.
    - Cloud Foundry Runtime (1GB)
    - SAP HANA Cloud
    - HTML5 Application Repository
    - Destination and Connectivity Services
    - (SAP Business Application Studio)
2. SAP Sub Account, SSO and HANA databases are already set up.
3. A destination is configured in the BTP cockpit to connect to the SAP system.
    - **Destination Name is:** s4v-ui-runtime (configured for Principal Propagation, not mandatory)
4. **Fiori Elements** is used to visualize the UI and we are building the app in such a way that it can be easily deployed to the SAP Fiori Launchpad
5. We are using **CAP Node.js** as a runtime for the core of the application
6. The information is ultimately stored in a HANA Cloud database. For local development and testing we use a SQLite database.

    
    





