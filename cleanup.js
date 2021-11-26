var AWS = require('aws-sdk');
var credentail = {
    accessKeyId: "ASIAYVTSDZ3RRROCBOOS",
    secretAccessKey: "5/CDl3ys116bgdWUW+OWK95znhPCMVi7f26h16xN",
    sessionToken: "IQoJb3JpZ2luX2VjEMP//////////wEaCXVzLWVhc3QtMSJHMEUCIFW1BJopJjdo6zjgFxzUo307inMVir+JSgPbQNmJC1+wAiEAvZz5bEeT8/m/cgATiYOgXBphSnhTHAQCS2DNYk9o65oqmwMIjP//////////ARAAGgw1OTYxNjYwMzcyMTkiDCutQ6aJGID4fnvsvCrvAgx7hMfB8MXSc+evBUIZo0U3mcKXeQRfHPuUjwGQ23K0agfrZJixZaeyfYlgwAJhYphFdz+6WGyUT8fDfbvK7+WYeM4JwkLvhavFLWB0egBABfyRU6UnPIZcay5NTkScQsYDb/bISdqhv/bUZ3uHOBUz987AzEAlpJTatHZA3ExEuerSXeiq/iEtyjVs7zT784XJPJet2PpQHmRq5b44IPW0KdyJLHyR0GZu1NIL5fmgj5WVBkRvdQM8ga0EzGkQscll+sAvECR8Ce0lH3d61SxKOi/R+m6pG6y9ROKdKmjjUI3kOjO1Wb8BlGkG+u21hQKcFr6WPjX7JJa7SlUTmzt9Smc5B28eDNrDQ2Wo/XKJvE/0hP92X2V3tG+vfORshFBhq9TDDjyMUSXxHekvoYOGQMuqzrLzsLFwJbj/D1f1LkSuezVxdf+x5bzQXVttpWmtuBlnfUKDuVpA/94aRvJxSLFRWosoJaSNCveTNT0w4/aCjQY6pgE+d7WTUT2grBEqXG94lwDpIpXplUGGaEcUenOkM5jLBUjeMWARHptFyoKbWO9L/BXYYosAzy/eCKrc9Kifg3SLMD96qvc03sCWpTPYV0/HnkNV0hPOh9vdcFMu1XqLQc1rqes0CwtNNNQFfFX4nn3cJFBt+1uF1kBD/FSLQRsfJ4E6SveJRl0hWLT2ePLlPUSqb8lR0N4LAK2IXbX6ziBiNPtMPt93",
    region: 'us-east-1'
};
var main = async () => {

    var regions = await getRegions();
    var credentails = [];
    regions.forEach(x => {
        console.log('region', x);
        var cred = JSON.parse(JSON.stringify(credentail));
        cred.region = x;
        credentails.push(cred);
    });


    await Promise.all(credentails.map(x => deleteBridge(x)));
}

var getRegions = () => new Promise((resolve) => {
    var collection = [];
    var aws = new AWS.EC2(credentail).describeRegions();
    aws.on('success', r => {
        r.data.Regions.forEach(x => {
            collection.push(x.RegionName);
        });
        resolve(collection);
    }).on('error', e => {
        console.log(e.message);
    }).send();
});

var removeTarget = (creds) => new Promise((resolve) => {
    console.log(JSON.stringify(creds, null, 2));
    var aws = new AWS.EventBridge(creds).removeTargets({ Rule: 'IntelligentDiscovery-event-forwarder', Ids: ['ID-Forwarder'] });
    aws.on('success', r => {
        console.log(r.data);
        resolve();
    }).on('error', e => {
        console.log(e.message);
    }).send();
});

var deleteBridge = (creds) => new Promise((resolve) => {
    console.log(JSON.stringify(creds, null, 2));
    var aws = new AWS.EventBridge(creds).deleteRule({ Name: 'IntelligentDiscovery-event-forwarder' });
    aws.on('success', r => {
        console.log(r.data);
        resolve();
    }).on('error', e => {
        console.log(e.message);
    }).send();
});

main();