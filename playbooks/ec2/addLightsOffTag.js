/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Sets lights out tags on EC2 instance when created
 * Compliance Frameworks: Cost Savings
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: ec2.amazonaws.com
 * eventName: RunInstances
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

    /**
     * all times are UTC so tag should be created with appropriate offset for
     * instance to be shutdown during region local time
     * set either tag to N/A to be ignored from lightsOn or lightsOff script
     * Example: 20:00 EST (Day light savings time) = 00:00 UTC 
     * Example: lightsOff = 18:00 lightsOn = N/A forces developers to power on when needed
     */

    const powerTimes = [
        { Region: 'eu-north-1', Offset: '01:00', powerOn: '07:00', powerOff: '19:00' },
        { Region: 'ap-south-1', Offset: '05:30', powerOn: '03:00', powerOff: '15:00' },
        { Region: 'eu-west-3', Offset: '01:00', powerOn: '07:00', powerOff: '19:00' },
        { Region: 'eu-west-2', Offset: '00:00', powerOn: '07:00', powerOff: '19:00' },
        { Region: 'eu-south-1', Offset: '01:00', powerOn: '07:00', powerOff: '19:00' },
        { Region: 'eu-west-1', Offset: '00:00', powerOn: '08:00', powerOff: '20:00' },
        { Region: 'ap-northeast-3', Offset: '09:00', powerOn: '23:00', powerOff: '11:00' },
        { Region: 'ap-northeast-2', Offset: '09:00', powerOn: '23:00', powerOff: '11:00' },
        { Region: 'ap-northeast-1', Offset: '09:00', powerOn: '23:00', powerOff: '11:00' },
        { Region: 'sa-east-1', Offset: '-03:00', powerOn: '11:00', powerOff: '23:00' },
        { Region: 'ca-central-1', Offset: '-04:00', powerOn: '12:00', powerOff: '00:00' },
        { Region: 'ap-southeast-1', Offset: '08:00', powerOn: '00:00', powerOff: '12:00' },
        { Region: 'ap-southeast-2', Offset: '10:00', powerOn: '22:00', powerOff: '10:00' },
        { Region: 'eu-central-1', Offset: '01:00', powerOn: '07:00', powerOff: '19:00' },
        { Region: 'us-east-1', Offset: '-05:00', powerOn: '13:00', powerOff: '01:00' },
        { Region: 'us-east-2', Offset: '-05:00', powerOn: '13:00', powerOff: '01:00' },
        { Region: 'us-west-1', Offset: '-08:00', powerOn: '16:00', powerOff: '04:00' },
        { Region: 'us-west-2', Offset: '-08:00', powerOn: '16:00', powerOff: '04:00' }
    ]

    if (event.playbook.type === 'schedule') {
        // setting our URL endpoint to get instances
        var url = `api/ec2/instances/${event.accountDetails.accountId}?RecordStatus=Active&fields=InstanceId,Region,Tags`;

        //calling our API endpoint to get the data
        var data = await helper.apiQuery(url);

        for (var i = 0; i < data.length; i++) {
            var params = {
                Resources: data[i].InstanceId,
                Tags: [
                    {
                        Key: 'cost:lightsOff',
                        Value: powerTimes.find(f => f.Region === data[i].Region).powerOff
                    },
                    {
                        Key: 'cost:lightsOn',
                        Value: powerTimes.find(f => f.Region === data[i].Region).powerOn
                    } 
                ]
            };
            var regionCredential = JSON.parse(JSON.stringify(credential));
            regionCredential.region = data[i].Region;

            await helper.awsApiCall(regionCredential, 'EC2', 'createTags', params);
            resolve({ remediationDone: true, data: response });
        };

    } else if (event.playbook.type === 'event') {
        var Instances = [];
        event.event.detail.responseElements.instancesSet.items.forEach(instance => {
            Instances.push(instance.instanceId);
        });

        var params = {
            Resources: Instances,
            Tags: [
                {
                    Key: 'cost:lightsOff',
                    Value: powerTimes.find(f => f.Region === event.event.awsRegion).powerOff
                },
                {
                    Key: 'cost:lightsOn',
                    Value: powerTimes.find(f => f.Region === event.event.awsRegion).powerOn
                }
            ]
        };

        await helper.awsApiCall(credential, 'EC2', 'createTags', params);
        resolve({ remediationDone: true, data: response });
    }
});
