const testlib = require('./test_lib');
const config = require('../config');


nets = Object.keys(config.xrpl)


describe('integration tests', () => {
    

    test('test ws connections', async () => {
        await Promise.all(nets.map(async (net) => {
            // console.log(config.xrpl[net].ws.url)
            await testlib.testWsConnection(config.xrpl[net].ws.url, timeout=10000);
        }));
    })

    // test('test grpc connections ', async () => {
    //     await Promise.all(nets.map(async (net) => {
    //         // console.log(config.xrpl[net].grpc.url)
    //         await testlib.testGrpcConnection(config.xrpl[net].grpc.url, isSecure=false, timeout=100000);
    //     }));
    // }, 110000)

    test('test pg connection', async () => {
        await testlib.testPgConnection(config.db);
    })

})

describe('config unit tests', () => {
    test('test ws urls', () => {
        for (net of nets)
            testlib.testWebsocketUrl(config.xrpl[net].ws.url);
    })
    test('test grpc urls', () => {
        for (net of nets)
            testlib.testGrpcUrl(config.xrpl[net].grpc.url);
    })

    test('test pg config', () => {
        testlib.testPgConfig(config.db);
    })

})

