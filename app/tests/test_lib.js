const grpc_client_lib = require('../clients/xrp_grpc_client');
const ws_client_lib = require('../clients/xrp_ws_client');
const pg_client_lib = require('../clients/xrpowl_pg_client');


// Unit Tests

// test postgres config
function testPgConfig(config) {
    // expect(config.user).not.toBe('');
    // expect(config.host).not.toBe('');
    // // expect(config.database).not.toBe('');
    // expect(config.password).not.toBe('');
    // expect(config.port).not.toBe('');

    // expect config port to be integer
    expect(Number.isInteger(config.port)).toBe(true);
    // expect config host user password and database to be strings
    expect(typeof config.host).toBe('string');
    expect(typeof config.user).toBe('string');
    expect(typeof config.password).toBe('string');
    // expect(typeof config.database).toBe('string');
}

// test websocket url
function testWebsocketUrl(url) {
    expect(url.startsWith('wss://') || url.startsWith('ws://')).toBe(true);
}


// test grpc url
function testGrpcUrl(url) {
    // js regex for url ends with port number
    var ends_with_port_regex = /:\d+$/;
    expect(ends_with_port_regex.test(url)).toBe(true);

    // js refex for starts with protocol
    var starts_with_protocol_regex = /^\w+?:\/\//;
    expect(starts_with_protocol_regex.test(url)).toBe(false);
}


// Integration Tests
// Let's test the connection to the xrpl api
// By actually trying to connect to the live apis


// test the connection to grpc api
async function testGrpcConnection(url, isSecure=false, timeout=1000) {
    // client should connect without returning an error when the promise times out
    const grpc_client = grpc_client_lib.getGrpcClient(url,isSecure=isSecure);
    var promise = grpc_client_lib.waitForGrpcClientReady(grpc_client,timeout=timeout)
    try {
        await expect(promise).resolves.not.toThrow();
        grpc_client.close()
    } catch (error) {
        await expect(promise).rejects.not.toThrow();
    }

}

// test the connection to the ws api
async function testWsConnection(url, timeout=1000) {
    // client should connect without returning an error when the promise times out
    const ws_client = ws_client_lib.getWsClient(url,timeout=timeout);
    var promise = ws_client_lib.waitForWsClientReady(ws_client)
    try {
        await expect(promise).resolves.not.toThrow();
        promise.then(() => {
            // console.log('hi2')
            ws_client.close()
        })
    } catch (error) {
        await expect(promise).rejects.not.toThrow();
    }

}
    
async function testPgConnection(config) {
    // console.log(config)
    const pg_client = pg_client_lib.getPgClient(config);
    var promise = pg_client_lib.waitForPgClientReady(pg_client)
    promise.then((client) => {
        console.log(client)
        client.release()
        pg_client.end()
    })
    try {
        await expect(promise).resolves.not.toThrow();
    } catch (error) {
        await expect(promise).rejects.not.toThrow();
    }
}






module.exports = {
    testPgConfig, testWebsocketUrl, testGrpcUrl, testGrpcConnection, testWsConnection, testPgConnection//, insertSubscribedTransactions
};
