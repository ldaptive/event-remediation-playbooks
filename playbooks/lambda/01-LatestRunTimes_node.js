/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-10-10
 * Description: Removes public access for KMS key
 * Compliance Frameworks: NIST, PCI-DSS, AWS
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: lambda.amazonaws.com
 * eventName: CreateFunction20150331, UpdateFunctionConfiguration20150331v2,
 *            UpdateFunctionConfiguration20150331v2
 * =======================================================================
 */

//import required to interact with aws
const AWS = require('aws-sdk');
const helper = require('./helper');
const now = new Date().toISOString();
const latestRuntime = 'nodejs14.x';

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
        var url = `api/lambda/functions/${event.accountDetails.accountId}?RecordStatus=Active&Runtime[startswith]=nodejs&fields=FunctionName,Runtime,FunctionArn,Region`;

        // calling the api endpoint
        var data = await helper.apiQuery(url);

        for (var i = 0; i < data.length; i++) {
            if (data[i].Runtime !== latestRuntime) {
                // setting credential specific for region of the expired certificate
                var regionCredential = JSON.parse(JSON.stringify(credential));
                regionCredential.region = data[i].Region;

                console.log('attempting to resolve function', data[i]);
                // Setting basic encryption on the bucket
                await helper.awsApiCall(regionCredential, 'Lambda', 'updateFunctionConfiguration', { FunctionName: data[i].FunctionArn, Runtime: latestRuntime });
            }
        }
        resolve({ remediationDone: true, data: data });
    } else if (event.playbook.type === 'event') {
        // getting our eventObject
        var lambdaFunction = event.event.detail.requestParameters;

        // checking if encryption is currently enabled
        await helper.awsApiCall(credential, 'Lambda', 'updateFunctionConfiguration', { FunctionName: lambdaFunction.FunctionArn, Runtime: latestRuntime });
        resolve({ remediationDone: true, data: lambdaFunction });
    }
});

