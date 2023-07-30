# Cloud Foundry Deployment

1. Add the necessary CAP components via `cds add mta,hana,xsuaa --for production`

2. To generate the necessary Fiori deployment configuration
    1. Switch to directory `app/adminapp`
    2. Add the Fiori deployment configuration with command `fiori add deploy-config`
        - **Target:** Cloud Foundry
        - **Destination:** cds-customer-stepbystep-srv-api (I usually use whatever my service name is followed by `-api`)
    3. Change back to the root directory

3. To generate the managed app router content to access the HTML5 repo from the app router, you would usually run the `Application Router Generator` of the Fiori tools, but as of V1.10.3 of the Fiori tools, the generator does not work correctly with CAP projects. 
    1. To get around this, you can use a custom Rizing tool. 
        - Execute the following command `npx @rizing/cds-customer-stepbystep-tool <SAP CAP Project Root Directory> force`

4. run the packaging command `npm run build`
5. run the deployment command `npm run deploy`



## Additional Step Details
1. The Cloud Foundry addition adds/changes the following information
    1. The `mta.yaml` file was created
    2. The `package.json` file was updated
    3. A very basice `xs-security.json` file was created
    4. An `undeploy.json` file was created in the db folder
    5. A file called `.hdiconfig` was created in the db/src folder

2. The Generation of the Fiori Deployment App will add the following
    1. Update of the `mta.yaml` file sections
        1. General Section
            ```yaml
            parameters:
                deploy_mode: html5-repo
            ```
        2. Modules section
            ```yaml
                - name: cds-customer-stepbystep-app-content
                type: com.sap.application.content
                path: .
                requires:
                - name: cds-customer-stepbystep-repo-host
                parameters:
                    content-target: true
                build-parameters:
                build-result: resources
                requires:
                - artifacts:
                    - rizdevtoberuiadminapp.zip
                    name: rizdevtoberuiadminapp
                    target-path: resources/
            - name: rizdevtoberuiadminapp
                type: html5
                path: app/adminapp
                build-parameters:
                build-result: dist
                builder: custom
                commands:
                - npm install
                - npm run build:cf
                supported-platforms: []
            ```
        3. Resources section
            ```yaml
                - name: cds-customer-stepbystep-repo-host
                type: org.cloudfoundry.managed-service
                parameters:
                service: html5-apps-repo
                service-name: cds-customer-stepbystep-html5-srv
                service-plan: app-host
            - name: cds-customer-stepbystep-destination-service
                type: org.cloudfoundry.managed-service
                parameters:
                config:
                    HTML5Runtime_enabled: false
                    init_data:
                    instance:
                        destinations:
                        - Authentication: NoAuthentication
                        Name: ui5
                        ProxyType: Internet
                        Type: HTTP
                        URL: https://ui5.sap.com
                        existing_destinations_policy: update
                    version: 1.0.0
                service: destination
                service-name: cds-customer-stepbystep-destination-service
                service-plan: lite
            ```
    2. Additioon of undeploy, build and deploy scripts to root package.json
    3. Addition of build:cf script to app/adminapp/package.json
    4. Addition of ui5-deploy.yaml file to app/adminapp with following content
        ```yaml
            # yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json
            specVersion: '2.4'
            metadata:
            name: riz.devtober.ui.adminapp
            type: application
            resources:
            configuration:
                propertiesFileSourceEncoding: UTF-8
            builder:
            resources:
                excludes:
                - "/test/**"
                - "/localService/**"
            customTasks:
            - name: webide-extension-task-updateManifestJson
                afterTask: replaceVersion
                configuration:
                appFolder: webapp
                destDir: dist
            - name: ui5-task-zipper
                afterTask: generateCachebusterInfo
                configuration:
                archiveName: rizdevtoberuiadminapp
                additionalFiles:
                - xs-app.json
        ```
    5. Update of xs-app.json file
        ```json
        {
        "welcomeFile": "/index.html",
        "authenticationMethod": "route",
        "routes": [
            {
            "source": "^/odata/(.*)$",
            "target": "/odata/$1",
            "destination": "cds-customer-stepbystep-srv-api",
            "authenticationType": "xsuaa",
            "csrfProtection": false
            },
            {
            "source": "^/resources/(.*)$",
            "target": "/resources/$1",
            "authenticationType": "none",
            "destination": "ui5"
            },
            {
            "source": "^/test-resources/(.*)$",
            "target": "/test-resources/$1",
            "authenticationType": "none",
            "destination": "ui5"
            },
            {
            "source": "^(.*)$",
            "target": "$1",
            "service": "html5-apps-repo-rt",
            "authenticationType": "xsuaa"
            }
        ]
        }
        ```
3. The Manages App Router Configurator makes the following modifications: 
    1. Changes to mta.yaml
        1. Change schema version to 3.2
        ```yaml
        _schema-version: "3.2"
        ```
        2. Add the destination content
        ```yaml
          - name: cds-customer-stepbystep-dest-content
            type: com.sap.application.content
            requires:
            - name: cds-customer-stepbystep-destination-service
            parameters:
                content-target: true
            - name: cds-customer-stepbystep-repo-host
            parameters:
                service-key:
                name: cds-customer-stepbystep-repo-host-key
            - name: cds-customer-stepbystep-uaa
            parameters:
                service-key:
                name: cds-customer-stepbystep-uaa-key
            parameters:
            content:
                instance:
                destinations:
                - Name: cds-customer-stepbystep_repo_host
                    ServiceInstanceName: cds-customer-stepbystep-html5-srv
                    ServiceKeyName: cds-customer-stepbystep-repo-host-key
                    sap.cloud.service: cds-customer-stepbystep
                - Authentication: OAuth2UserTokenExchange
                    Name: cds-customer-stepbystep_uaa
                    ServiceInstanceName: cds-customer-stepbystep-xsuaa-srv
                    ServiceKeyName: cds-customer-stepbystep-uaa-key
                    sap.cloud.service: cds-customer-stepbystep
                existing_destinations_policy: update
            build-parameters:
            no-source: true
        ```
        3. The XSUAA service 
            1. In contrast to the CAP application this generator wants to call the service [mta-id]-uaa and not [mta-id]-auth (CAP convention)
            2. There is an explicit reference to the service name in the parameters section. This explicit is used in the destination content section above and could be 
            ```yaml
                service-name: cds-customer-stepbystep-xsuaa-srv
            ```
    2. Changes to the package.json
        1. Addition of the following scripts
           ```json
            "clean": "rimraf resources mta_archives mta-op*",
            "build": "rimraf resources mta_archives && mbt build --mtar archive",
            "deploy": "cf deploy mta_archives/archive.mtar --retries 1",
            "undeploy": "cf undeploy cds-customer-stepbystep --delete-services --delete-service-keys --delete-service-brokers"
           ```

