const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const playbookRecords = require('./playbookRecords').records;

const credentails = { accessKeyId: "AKIAYA4A4FTGT3C3GWZA", secretAccessKey: "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", region: 'eu-west-1' }
const dir = './playbooks'
var directories = [];
var playbooks = [];
var main = async () => {
    console.log('in main');
    var files = await getAllFiles(dir);
    console.log('here are all our directories to be created', directories);
    console.log('here are all our playbooks to be created', playbooks);
    var bucket = await getBucketName();
    if (bucket.success) {
        var bucketName = bucket.data.playbookBucket;
        console.log(bucketName);
        await Promise.all(directories.map(x => createObject(bucketName, x)));
        var deployedPlaybooks = await getObjects(bucketName, 'playbooks/');
        console.log(JSON.stringify(deployedPlaybooks, null, 2));

        var uploads = [];
        playbooks.forEach(x => {
            if (deployedPlaybooks.filter(f => f === x).length === 0) {
                uploads.push(x);
            }
        });
        console.log(JSON.stringify(uploads, null, 2));
        await Promise.all(uploads.map(x => createObject(bucketName, x)));
    } else {
        console.log(bucket);
        process.exit(22);
    }
    var records = JSON.parse(JSON.stringify(playbookRecords));
    var currentRecords = await getCurrentPlaybooks();
    currentRecords = currentRecords.data;
    console.log(JSON.stringify(currentRecords, null, 2));

    var insertRecords = [];
    records.forEach(x => {
        if (currentRecords.filter(f => f.playbookId === x.playbookId).length === 0) {
            insertRecords.push(x);
        }
    });
    await Promise.all(insertRecords.map(x => insertRecord(x)));
};

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            directories.push((dirPath + "/" + file + '/').substring(2, (dirPath + "/" + file + '/').length));
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(dirPath + "/" + file)
            playbooks.push((dirPath + "/" + file + '/').substring(2, (dirPath + "/" + file).length));
        }
    });
    return arrayOfFiles
}

var getBucketName = () => new Promise((resolve) => {
    var params = {
        TableName: 'IntelligentDiscovery-local-applicationSettings',
        Key: {
            item: 'CollectionTask'
        }
    };
    var retry = 0;
    var collect = (params) => {
        // var aws = new AWS.DynamoDB.DocumentClient().get(params);
        var aws = new AWS.DynamoDB.DocumentClient(credentails).get(params);
        aws.on('success', r => {
            resolve({ success: true, status: 'success', data: r.data.Item });
        }).on('error', e => {
            retry += 1;
            if (retry <= 1) {
                params.TableName = 'IntelligentDiscovery-saas-applicationSettings'
                collect(params);
            } else {
                resolve({ success: false, status: 'error', message: e.message });
            }
        }).send();
    }
    collect(params);
});

var createObject = (bucket, key) => new Promise(async (resolve) => {
    var params = { Bucket: bucket, Key: key };
    if (!key.endsWith('/')) {
        var data = fs.readFileSync('./' + key, 'utf8');
        params.Body = data;
    }
    var aws = new AWS.S3(credentails).putObject(params);
    aws.on('success', r => {
        console.log(r.data);
        resolve()
    }).on('error', e => {
        console.log('error creating object', e.message);
    }).send();
});

var getObjects = (bucket, prefix) => new Promise((resolve) => {
    var files = [];
    var params = { Bucket: bucket, Prefix: prefix };
    var collect = (params) => {
        var aws = new AWS.S3(credentails).listObjectsV2(params);
        aws.on('success', r => {
            r.data.Contents.forEach(x => {
                files.push(x.Key)
            });
            if (r.data.NextContinuationToken) {
                params.ContinuationToken = r.data.NextContinuationToken;
                collect(params);
            } else {
                resolve(files);
            }
        }).on('error', e => {
            console.log('error');
        }).send();
    }
    collect(params)
})
var checkForObject = (bucket, key) => new Promise(async (resolve) => {
    var aws = new AWS.S3(credentails).putObject({ Bucket: bucket, Key: key });
    aws.on('success', r => {
        console.log('i have an object', r.data);
    }).on('error', e => {
        console.log('i have an error', e.message);
    }).send();
});

var insertRecord = (record) => new Promise(async (resolve) => {
    var retry = 0;
    var params = {
        TableName: 'IntelligentDiscovery-local-remediationPlaybooks',
        Item: record
    };
    var insert = (params) => {
        var aws = new AWS.DynamoDB.DocumentClient(credentails).put(params);
        aws.on('success', r => {
            console.log(r.data);
            resolve({ success: true, status: 'success', data: r.data.Item });
        }).on('error', e => {
            var retry = + 1;
            if (retry <= 1) {
                params.TableName = 'IntelligentDiscovery-saas-remediationPlaybooks'
                insert(params);
            } else {
                resolve({ success: false, status: 'error', message: e.message });
            }
        }).send();
    }
    insert(params);
});

var getCurrentPlaybooks = () => new Promise((resolve) => {
    var params = { TableName: 'IntelligentDiscovery-local-remediationPlaybooks' };
    var retry = 0;
    var collect = (params) => {
        // var aws = new AWS.DynamoDB.DocumentClient().get(params);
        var aws = new AWS.DynamoDB.DocumentClient(credentails).scan(params);
        aws.on('success', r => {
            resolve({ success: true, status: 'success', data: r.data.Items });
        }).on('error', e => {
            retry += 1;
            if (retry <= 1) {
                params.TableName = 'IntelligentDiscovery-local-remediationPlaybooks'
                collect(params);
            } else {
                resolve({ success: false, status: 'error', message: e.message });
            }
        }).send();
    }
    collect(params);
})
main();