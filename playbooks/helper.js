/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-04-12
 * Description: Helper functions available to all playbooks
 * =======================================================================
 */
 process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const https = require('https');
const http = require('http');
const AWS = require('aws-sdk');
const { appendFile } = require('fs');

/**
 * @param {Object} credentials      required for interacting with AWS directly these should be available from the event
 * @param {String} awsClass         AWS Class we want to Interact with (example: EC2, ECS, Lambda)
 * @param {String} awsMethod        AWS Class method that should be carried out (example: describeInstances)
 * @param {Object} params           Optional - Passed if required for the method. Look to leverage script builder to get required parameters
 * @returns {Object}
 */
module.exports.awsApiCall = (credentials, awsClass, awsMethod, params) => new Promise((resolve) => {
    console.log('here is what we have in api call', credentials, awsClass, awsMethod, params)
    var retry = 1;
    var run = (credentials, awsClass, awsMethod, params) => {
        var aws = new AWS[awsClass](credentials)[awsMethod](params);
        aws.on('success', r => {
            console.log('here aws API response', r.data)
            resolve({ success: true, data: r.data });
        }).on('error', e => {
            console.log('we have an error', e);
            if (e.message.includes('exceeded')) {
                setTimeout(() => { run(credentials, awsClass, awsMethod, params); return; }, retry * 500);
            }
            resolve({ success: false, message: e.message });
        }).send();
    }
    run(credentials, awsClass, awsMethod, params);
});

/** 
 * Internal function for getting API read only key for Intelligent Discovery Data
 */
var accessKey = () => new Promise((resolve) => {
    console.log('i am in access key');
    var aws = new AWS.SSM({ region: process.env.AWS_REGION }).getParameter({ Name: 'IntelligentDiscovery-RO-ApiKey', WithDecryption: true });
    aws.on('success', r => {
        // console.log('here is my key', r.data);
        resolve(r.data.Parameter.Value)
    }).on('error', e => {
        console.log('error getting api-key', e.message);
        resolve('nothing');
    }).send();
});

var adapterFor = (function () {
    var url = require('url'),
        adapters = {
            'http:': require('http'),
            'https:': require('https'),
        };

    return function (inputUrl) {
        return adapters[url.parse(inputUrl).protocol]
    }
}());

var appEndpoint = () => new Promise((resolve) => {
    var aws = new AWS.SSM().getParameter({ Name: 'IntelligentDiscovery-App-Endpoint', WithDecryption: true });
    aws.on('success', r => {
        resolve(r.data.Parameter.Value)
    }).on('error', e => {
        console.log('error getting api-key', e.message);
        resolve('nothing');
    }).send();
});


/**
 * 
 * @param {string} url      api endpoint that we will query
 * @returns {object}        data object
 */
module.exports.apiQuery = (url) => new Promise(async (resolve) => {
    console.log('i am calling access key')
    var key = await accessKey();
    var endpoint = await appEndpoint();
    // var endpoint = process.env.appEndpoint;
    if (!url.startsWith('/')) {
        url = `/${url}`
    }
    // url = endpoint + url;
    url = endpoint + url;
    console.log('here is the URL i am calling:', url, key);

    var callQuery = (url) => {
        console.log('in call Query');
        console.log('here is my API Key', key)
        adapterFor(url).get(url, { headers: { 'ldaptive-api-key': key, 'Content-Type': 'application/json', } }, (res) => {
            res.setEncoding('utf8');
            var dataResponse = '';
            res.on('data', chunk => {
                dataResponse += chunk
            }).on('error', e => {
                console.log('i have an error in http.get', e)
                resolve({ success: false, message: e.message });
            }).on('end', () => {
                console.log('here is data response', dataResponse);
                if(dataResponse.includes('301 Moved Permanently') && url.startsWith('http://')){
                    console.log('trying recall now')
                    url = url.replace('http://', 'https://');
                    console.log('new query', url);
                    return callQuery(url);
                } else {
                    return resolve(JSON.parse(dataResponse));
                    // return resolve()
                }
                // resolve(JSON.parse(JSON.stringify(dataResponse)));
            });
        });
    }
    callQuery(url);
});

/** 
 * settings for powerOff and powerOn should reflect with the offset
 * example: setting power down for us-east-1 at 19:00 local time = 23:00
 */

module.exports.regionOffsets = [
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
    { Region: 'us-east-1', Offset: '-04:00', powerOn: '12:00', powerOff: '00:00' },
    { Region: 'us-east-2', Offset: '-04:00', powerOn: '12:00', powerOff: '00:00' },
    { Region: 'us-west-1', Offset: '-07:00', powerOn: '15:00', powerOff: '03:00' },
    { Region: 'us-west-2', Offset: '-07:00', powerOn: '15:00', powerOff: '03:00' }
]