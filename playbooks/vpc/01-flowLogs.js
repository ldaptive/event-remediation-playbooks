/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Enabled VPC Flow Logs
 * Compliance Frameworks: CIS, NIST, GDPR, PCI-DSS
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: ec2.amazonaws.com
 * eventName: CreateVpc
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
    if (event.event.awsRegion) { credential.region = event.event.awsRegion };

    // change role to name that your organization uses
    const iamRoleName = 'VPCFlowLogDeliveryRole'
    const VPCFlowLogRoleTrustRelationShip = { Version: "2012-10-17", Statement: [{ Effect: "Allow", Principle: { Service: "vpc-flow-logs.amazonaws.com" }, Action: "sts.AssumeRole" }] };
    const VPCFlowLogRolePolicy = { Version: "2012-10-17", Statement: [{ Action: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:DescribeLogGroups", "logs:DescribeLogStreams", "logs:PutLogEvents"], Effect: "Allow", Resource: "*" }] };

    if (event.playbook.type === 'schedule') {
        // setting our API endpoint to get data from IntelligentDiscovery
        var url = `api/vpc/vpc/${event.accountDetails.accountId}?RecordStatus=Active&FlowLogs=DISABLED&fields=CidrBlock,Region,VpcId`;

        // calling the api endpoint
        var data = await helper.apiQuery(url);
        if (data.length > 0) {
            var iamRole = getIamRole();
        }
        for (var i = 0; i < data.length; i++) {
            // setting credential specific for region of the expired certificate
            var regionCredential = JSON.parse(JSON.stringify(credential));
            regionCredential.region = data[i].Region;

            // Creating the flow log
            await helper.awsApiCall(regionCredential, 'EC2', 'createFlowLogs', { ResourceIds: [data[i].VpcId], ResourceType: 'VPC', TrafficType: 'ALL', DeliverLogsPermissionArn: iamRole.Arn, LogGroupName: 'VPCFlowLogs/' + data[i].VpcId });
        }
        resolve({ remediationDone: true, data: data });

    } else if (event.playbook.type === 'event') {
        // getting our eventObject
        var item = event.event.detail.responseElements.vpc;

        // validating the scan on push is enabled
        await helper.awsApiCall(credential, 'EC2', 'createFlowLogs', { ResourceIds: item.VpcId, ResourceType: 'VPC', TrafficType: 'ALL', DeliverLogsPermissionArn: iamRole.Arn, LogGroupName: 'VPCFlowLogs/' + data[i].VpcId });
        resolve({ remediationDone: true, data: item });
    }
});

function getIamRole() {
    return new Promise(async (resolve) => {
        var iamRole = await helper.awsApiCall(regionCredential, 'IAM', 'getRole', { RoleName: iamRoleName });
        if (!iamRole) {
            // delivery role does not existing - creating role here
            await helper.awsApiCall(regionCredential, 'IAM', 'createRole', { RoleName: iamRoleName, AssumeRolePolicyDocument: JSON.stringify(VPCFlowLogRoleTrustRelationShip, null, 2) });
            await helper.awsApiCall(regionCredential, 'IAM', 'putRolePolicy', { RoleName: iamRoleName, PolicyName: 'VPCFlowLogDeliveryRolePolicy', PolicyDocument: JSON.stringify(VPCFlowLogRolePolicy, null, 2) });
            iamRole = await helper.awsApiCall(regionCredential, 'IAM', 'getRole', { RoleName: iamRoleName })
        }
        resolve(iamRole.data.Role);
    });
}