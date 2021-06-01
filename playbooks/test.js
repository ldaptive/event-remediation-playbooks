const http = require('http');
var main = async()=> {
    console.log('in main')
    var data = await exports.apiQuery();
    console.log(JSON.stringify(data, null, 2));
};


module.exports.apiQuery = () => new Promise(async (resolve) => {
    console.log('in apiQuer')
    var key = 'a783b673-519f-41ba-aec5-d71388ea9f31';
    var endpoint = 'http://local-ELB-1709395448.eu-west-1.elb.amazonaws.com';
    var url = 'api/dynamo/tables/551636708557?RecordStatus=Active&fields=TableId,SSEDescription,accountId,Region,TableName'
    if (!url.startsWith('/')) {
        url = `/${url}`
    }
    url = endpoint + url;
    http.get(url, { headers: { 'ldaptive-api-key': key } }, (res) => {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', chunk => {
            data += chunk
        }).on('error', e => {
            console.log('i have an error in http.get', e)
            resolve({ success: false, message: e.message });
        }).on('end',()=>{
            resolve(JSON.parse(data));
        });
    });
});


main();


