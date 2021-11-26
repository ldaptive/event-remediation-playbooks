/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Sets Over Provisioned DynamoDB table to On-Demand for cost savings
 * ControlID: EC2.01 - EC2.24
 * Compliance Frameworks: CIS, NIST, GDPR, PCI-DSS
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: ec2.amazonaws.com
 * eventName: AuthorizeSecurityGroupIngress
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
    console.log(JSON.stringify('in remediation', event));
    var credential = JSON.parse(JSON.stringify(event.credentials));
    if (event.event.region) { credential.region = event.event.region };

    var vulnerablePorts = [
        { portId: 22, service: 'SSH' },
        { portId: 3389, service: 'RDP' },
        { portId: 139, service: 'NetBIOS' },
        { portId: 445, service: 'CIFS/SMB' },
        { portId: 1433, service: 'MSSQL' },
        { portId: 1521, service: 'Oracle' },
        { portId: 3306, service: 'MySQL' },
        { portId: 5432, service: 'PostgreSQL' },
        { portId: 5500, service: 'VNC Client' },
        { portId: 7199, service: 'Casandra' },
        { portId: 27017, service: 'MongoDB' },
        { portId: 389, service: 'LDAP' },
        { portId: 636, service: 'Secure LDAP' },
        { portId: 5985, service: 'WinRM' },
        { portId: 6379, service: 'Redis' },
        { portId: 53, service: 'DNS' },
        { portId: 9200, service: 'Elasticsearch' },
        { portId: 21, service: 'FTP' },
        { portId: 5601, service: 'Kibana' }
    ];

    if (event.playbook.type === 'schedule') {
        // setting our API endpoint to get data from IntelligentDiscovery
        var url = `api/ec2/securitygroups/${event.accountDetails.accountId}?RecordStatus=Active&fields=accountId,GroupId,inGress,Region`;

        // calling the api endpoint
        var data = await helper.apiQuery(url);
        data = JSON.parse(JSON.stringify(data));

        for (var i = 0; i < data.length; i++) {
            if(data[i].inGress){
                var ingressRules = data[i].inGress.filter(f => f.Permission === '0.0.0.0/0').length;
                if (ingressRules.length > 0) {
                    for (var n = 0; n < ingressRules.length; n++) {
                        if (ingressRules[n].ipProtocol === '-1' || ingressRules[n].fromPort === vulnerablePorts[i].portId || ingressRules[n].toPort === vulnerablePorts[i].portId || (vulnerablePorts[i].portId > ingressRules[n].fromPort && vulnerablePorts[i].portId < ingressRules[n].toPort)) {
    
                            // setting credential specific for region of the expired certificate
                            var regionCredential = JSON.parse(JSON.stringify(credential));
                            regionCredential.region = data[i].Region;
    
                            await helper.awsApiCall(regionCredential, 'EC2', 'revokeSecurityGroupIngress', {
                                GroupId: data[i].GroupId,
                                IpPermissions: [
                                    {
                                        FromPort: ingressRules[n].FromPort,
                                        ToPort: ingressRules[n].ToPort,
                                        IpProtocol: ingressRules[n].IpProtocol,
                                        IpRanges: [
                                            {
                                                CidrIp: ingressRules[n].IpProtocol
                                            }
                                        ]
                                    }
                                ]
                            });
                        }
                    }
                }
            }
        }
        resolve({ remediationDone: true, data: data });

    } else if (event.playbook.type === 'event') {
        var revokedRules = [];
        var ingressRules = event.event.detail.requestParameters.ipPermissions.items
        for (var i = 0; i < vulnerablePorts.length; i++) {
            for (var n = 0; n < ingressRules.length; n++) {
                console.log('here is the rule working on', JSON.stringify(ingressRules[n], null, 2));
                if (ingressRules[n].ipProtocol === '-1' || ingressRules[n].fromPort === vulnerablePorts[i].portId || ingressRules[n].toPort === vulnerablePorts[i].portId || (vulnerablePorts[i].portId > ingressRules[n].fromPort && vulnerablePorts[i].portId < ingressRules[n].toPort)) {
                    if (Object.keys(ingressRules[n].ipRanges).length > 0) {
                        if (ingressRules[n].ipRanges.items[0].cidrIp === '0.0.0.0/0') {
                            var params = {
                                GroupId: event.event.detail.requestParameters.groupId,
                                IpPermissions: [
                                    {
                                        FromPort: ingressRules[n].fromPort,
                                        ToPort: ingressRules[n].toPort,
                                        IpProtocol: ingressRules[n].ipProtocol,
                                        IpRanges: [
                                            {
                                                CidrIp: ingressRules[n].ipRanges.items[0].cidrIp
                                            }
                                        ]
                                    }
                                ]
                            };
                            await helper.awsApiCall(credential, 'EC2', "revokeSecurityGroupIngress", params);
                            revokedRules.push(params);
                        }
                    }
                    if (Object.keys(ingressRules[n].ipv6Ranges).length > 0) {
                        if (ingressRules[n].ipv6Ranges.items[0].cidrIpv6 === '::/0') {
                            var params = {
                                GroupId: event.event.detail.requestParameters.groupId,
                                IpPermissions: [
                                    {
                                        FromPort: ingressRules[n].fromPort,
                                        ToPort: ingressRules[n].toPort,
                                        IpProtocol: ingressRules[n].ipProtocol,
                                        Ipv6Ranges: [
                                            {
                                                CidrIpv6: ingressRules[n].ipv6Ranges.items[0].cidrIpv6
                                            }
                                        ]
                                    }
                                ]
                            };
                            console.log(JSON.stringify(params, null, 2));
                            await helper.awsApiCall(credential, 'EC2', "revokeSecurityGroupIngress", params);
                            revokedRules.push(params);
                        }
                    }
                }
            }
        }
        if (revokedRules.length > 0) {
            resolve({ remediationDone: true, data: revokedRules })
        } else {
            resolve({ remediationDone: false });
        }
    }
});