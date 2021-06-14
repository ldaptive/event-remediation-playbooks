/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Sets ECR to scan for vulnerabilities on push
 * Compliance Frameworks: CIS
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: ecr.amazonaws.com
 * eventName: CreateRepository
 * =======================================================================
 */

//import required to interact with aws
const AWS = require('aws-sdk');
const helper = require('./helper');
const now = new Date().toISOString();

/**
 * @param {Object} event the entire payload being passed from step function
 * @param {Object} event.accountDetails the information specific to this account
 * @param {Object} event.credentials the credentials needed to interact with the offending account
 * @param {Object} event.event the cloudwatch alarm event that was passed
 * @param {Object} event.playbook the information of what steps should be taken on this event
 * @param {Object} event.userDetails the user information of who triggered the event
 */

module.exports.run = (event) => new Promise(async (resolve) => {
    // setting our credential specific to the region where the event occurred
    var credential = JSON.parse(JSON.stringify(event.credentials));
    if (event.event.region) { credential.region = event.event.region };

    if (event.playbook.type === 'schedule') {
        // setting our API endpoint to get data from IntelligentDiscovery
        var url = `api/ecr/repositories/${event.accountDetails.accountId}?RecordStatus=Active&scanOnPush=false&fields=scanOnPush,Region,repositoryName`;

        // calling the api endpoint
        var data = await helper.apiQuery(url);

        for (var i = 0; i < data.length; i++) {
            // setting credential specific for region of the expired certificate
            var regionCredential = JSON.parse(JSON.stringify(credential));
            regionCredential.region = data[i].Region;

            // Setting basic encryption on the bucket
            await helper.awsApiCall(regionCredential, 'ECR', 'putImageScanningConfiguration', { repositoryName: data[i].repositoryName, imageScanningConfiguration: { scanOnPush: true } });
        }
        resolve({ remediationDone: true, data: data });
    } else if (event.playbook.type === 'event') {
        // getting our eventObject
        var item = event.event.detail.responseElements.repository;

        // validating the scan on push is enabled
        if (item.imageScanningConfiguration.scanOnPush === false) {
            // enabling scan on push
            await helper.awsApiCall(credential, 'ECR', 'putImageScanningConfiguration', { repositoryName: item.repositoryName, imageScanningConfiguration: { scanOnPush: true } });
            resolve({ remediationDone: true, data: item });
        } else {
            resolve({ remediationDone: false, data: 'scanning is enabled' });
        }
    }
});
