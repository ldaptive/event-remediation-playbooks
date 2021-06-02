module.exports.records = [
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-0e5d03527bf785f24c1ebfe368cc305f",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:52:38.048Z",
        "createdBy": "administrator",
        "name": "VPC-FlowLogs",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/vpc/01-flowLogs.js",
        "remediationRequired": true,
        "description": "Ensures newly created VPC's have flow logs enabled",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:52:38.048Z",
        "eventRule": {
            "source": [
                "aws.ec2"
            ],
            "detail": {
                "eventSource": [
                    "ec2.amazonaws.com"
                ],
                "eventName": [
                    "CreateVpc"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-25abfeaaa9f41ef0784eb4c6fbb4a4f3",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:50:45.409Z",
        "createdBy": "administrator",
        "name": "S3EncryptedAtRest",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/s3/01-EncryptionAtRest.js",
        "remediationRequired": true,
        "description": "Sets buckets to be encrypted at rest",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:50:45.409Z",
        "eventRule": {
            "source": [
                "aws.s3"
            ],
            "detail": {
                "eventSource": [
                    "s3.amazonaws.com"
                ],
                "eventName": [
                    "CreateBucket"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-27698eca54a9f8bc2adafc22eb5b77c4",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:51:31.173Z",
        "createdBy": "administrator",
        "name": "s3PublicBucket",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/s3/02-PublicBucket.js",
        "remediationRequired": true,
        "description": "Ensures bucket is not set to be publicly accessible",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:51:31.173Z",
        "eventRule": {
            "source": [
                "aws.s3"
            ],
            "detail": {
                "eventSource": [
                    "s3.amazonaws.com"
                ],
                "eventName": [
                    "CreateBucket"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-4d26fb8e77f9b34c1e77091aede1079e",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:48:44.815Z",
        "createdBy": "administrator",
        "name": "RDS-PubliclyAccessible",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/rds/01-publiclyAccessible.js",
        "remediationRequired": true,
        "description": "Removes RDS instance from being publicly accessible",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:48:44.815Z",
        "eventRule": {
            "source": [
                "aws.rds"
            ],
            "detail": {
                "eventSource": [
                    "rds.amazonaws.com"
                ],
                "eventName": [
                    "CreateDBCluster",
                    "CreateDBInstance",
                    "ModifyDBCluster",
                    "ModifyDBInstance"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-68daefa5d5cc3a1fbb6eeec73402e0b3",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:40:47.565Z",
        "createdBy": "administrator",
        "name": "EBS-PublicSnapshots",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/ebs/05-PublicSnapshots.js",
        "remediationRequired": true,
        "description": "Reverts snapshots to private if set to pubic",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:40:47.565Z",
        "eventRule": {
            "source": [
                "aws.ec2"
            ],
            "detail": {
                "eventSource": [
                    "ec2.amazonaws.com"
                ],
                "eventName": [
                    "ModifyVolumeAttribute"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-7164970f0051d1c08f7ffab1e7015ae9",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:42:45.022Z",
        "createdBy": "administrator",
        "name": "EC2-TagNewInstance",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/ec2/TagNewInstances.js",
        "remediationRequired": true,
        "description": "Adds description tags to new EC2 Instsances",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:42:45.022Z",
        "eventRule": {
            "source": [
                "aws.ec2"
            ],
            "detail": {
                "eventSource": [
                    "ec2.amazonaws.com"
                ],
                "eventName": [
                    "RunInstances"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-9bde2d8244015e46bd65c474cd6418e0",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:36:55.223Z",
        "createdBy": "administrator",
        "name": "cloudWatch-SetLogRetentionTime",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/cloudWatch/setLogGroupRetentionTime.js",
        "remediationRequired": true,
        "description": "Sets new logs retention time under indefinite for cost savings",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:36:55.223Z",
        "eventRule": {
            "source": [
                "aws.logs"
            ],
            "detail": {
                "eventSource": [
                    "logs.amazonaws.com"
                ],
                "eventName": [
                    "CreateLogGroup"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-a4588f6212ba07085a17f91a50db81e9",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:38:38.482Z",
        "createdBy": "administrator",
        "name": "Dynamo-EnforceTableEncryption",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/dynamo/01-KmsEncrypted.js",
        "remediationRequired": true,
        "description": "Sets newly created DynamoDB tables to be encrypted at rest",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:38:38.482Z",
        "eventRule": {
            "source": [
                "aws.dynamodb"
            ],
            "detail": {
                "eventSource": [
                    "dynamodb.amazonaws.com"
                ],
                "eventName": [
                    "CreateTable"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-a8ffa0e2fbaec38355fffdf2251f4087",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:41:59.933Z",
        "createdBy": "administrator",
        "name": "EC2-CloseOpenInternetPorts",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/ec2/01-24_SensitivePortOpenedToInternet.js",
        "remediationRequired": true,
        "description": "Closes down vulnerable ports if exposed to internet like SSH",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:41:59.933Z",
        "eventRule": {
            "source": [
                "aws.ec2"
            ],
            "detail": {
                "eventSource": [
                    "ec2.amazonaws.com"
                ],
                "eventName": [
                    "AuthorizeSecurityGroupIngress"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-bb074f604e480dc0cf8e78627f8e6b02",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:47:29.345Z",
        "createdBy": "administrator",
        "name": "KMS-SetAutomaticKeyRotation",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/kms/02-automaticKeyRotation.js",
        "remediationRequired": true,
        "description": "Sets KMS keys to automatically be rotated by AWS",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:47:29.345Z",
        "eventRule": {
            "source": [
                "aws.kms"
            ],
            "detail": {
                "eventSource": [
                    "kms.amazonaws.com"
                ],
                "eventName": [
                    "CreateKey",
                    "DisableKeyRotation"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-bb16d58c60e25b1093951191bff67fa1",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:44:11.442Z",
        "createdBy": "administrator",
        "name": "ECR-MutableTags",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/ecr/03-tagMutable.js",
        "remediationRequired": true,
        "description": "Sets ECR repo to not allow tags to be changed",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:44:11.442Z",
        "eventRule": {
            "source": [
                "aws.ecr"
            ],
            "detail": {
                "eventSource": [
                    "ecr.amazonaws.com"
                ],
                "eventName": [
                    "CreateRepository"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-cce9232cda3b9c54dfff4f869a65dbab",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:33:16.989Z",
        "createdBy": "administrator",
        "name": "AMI-02_BlockPublic",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/ami/02-publicAmi.js",
        "remediationRequired": true,
        "description": "Reverts AMI  to private if set to public",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:33:16.989Z",
        "eventRule": {
            "source": [
                "aws.ec2"
            ],
            "detail": {
                "eventSource": [
                    "ec2.amazonaws.com"
                ],
                "eventName": [
                    "ModifyImageAttribute"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-e66a6aa1336bd4080c631a41eeadf54f",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:45:04.072Z",
        "createdBy": "administrator",
        "name": "ECR-ScanOnPush",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/ecr/04-scanOnPush.js",
        "remediationRequired": true,
        "description": "Sets ECR repository to be scanned for vulnerabilities on push",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:45:04.072Z",
        "eventRule": {
            "source": [
                "aws.ecr"
            ],
            "detail": {
                "eventSource": [
                    "ecr.amazonaws.com"
                ],
                "eventName": [
                    "CreateRepository"
                ]
            }
        },
        "type": "event"
    },
    {
        "customerId": "000000000000",
        "playbookId": "000000000000-f68a48af42c36247834a5361d14f3cb5",
        "communicationRequired": false,
        "updatedBy": "administrator",
        "creationDate": "2021-06-02T10:46:23.035Z",
        "createdBy": "administrator",
        "name": "KMS-BlockPublicAccess",
        "state": "DISABLED",
        "queryRequired": false,
        "remediationScript": "playbooks/kms/01-kmsPublicAccess.js",
        "remediationRequired": true,
        "description": "Blocks KMS keys from being exposed to the internet via policy",
        "userLookupRequired": false,
        "updatedDate": "2021-06-02T10:46:23.035Z",
        "eventRule": {
            "source": [
                "aws.kms"
            ],
            "detail": {
                "eventSource": [
                    "kms.amazonaws.com"
                ],
                "eventName": [
                    "CreateKey",
                    "PutKeyPolicy"
                ]
            }
        },
        "type": "event"
    }
]