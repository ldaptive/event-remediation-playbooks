/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Sets DynamoDB to use default encryption
 * Compliance Frameworks: NIST, HIPPA, GDPR, PCI-DSS
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: dynamodb.amazonaws.com
 * eventName: CreateTable
 * =======================================================================
 */

//import required to interact with aws
const AWS = require('aws-sdk');
const helper = require('./helper');
const now = new Date().toISOString();

/**
 * @param {Object} event                    the entire payload being passed from step function
 * @param {Object} event.accountDetails     the information specific to this account
 * @param {Object} event.credentials        the credentials needed to interact with the offending account
 * @param {Object} event.event              the cloudwatch alarm event that was passed
 * @param {Object} event.playbook           the information of what steps should be taken on this event
 * @param {Object} event.userDetails        the user information of who triggered the event
 */

module.exports.run = (event) => new Promise(async (resolve) => {
    // setting our credential specific to the region where the event occurred
    var credential = JSON.parse(JSON.stringify(event.credentials));
    if (event.event.region) { credential.region = event.event.region };

    if (event.playbook.type === 'schedule') {
        // setting our API endpoint to get data from IntelligentDiscovery
        var url = `api/dynamo/tables/${event.accountDetails.accountId}?RecordStatus=Active&fields=TableId,SSEDescription,accountId,Region,TableName`;

        // calling the api endpoint
        var data = await helper.apiQuery(url);

        for (var i = 0; i < data.length; i++) {
            // setting credential specific for region of the expired certificate
            var regionCredential = JSON.parse(JSON.stringify(credential));
            regionCredential.region = data[i].Region;
            await helper.awsApiCall(regionCredential, 'DynamoDB', 'updateTable', { TableName: date[i].TableName, SSESpecification: { Enabled: true, SSEType: 'AES256' } });
        }
        resolve({ remediationDone: true, data: data });
    } else if (event.playbook.type === 'event') {
        var item = event.event.detail.requestParameters;
        await helper.awsApiCall(credential, 'DynamoDB', 'updateTable', { TableName: item.tableName, SSESpecification: { Enabled: true, SSEType: 'AES256' } });
        resolve({ remediationDone: true, data: item });
    }
});
