const WebSocket = require('ws');

function getWsClient(url,timeout=1000) {
    // console.log(url)
    const ws = new WebSocket(url, {
        handshakeTimeout: timeout
      });
    return ws
}

function waitForWsClientReady(client) {
    return new Promise((resolve, reject) => {
        client.on('open', () => {
            // client.close()
            resolve();
            
        });
        client.on('error', (err) => {
            // if (retry > 0 && retry <= retry_limit) {
            //     setTimeout(() => {
            //         waitForWsClientReady(client, timeout, retry + 1, retry_limit)
            //     }, timeout);
            // } else {
                reject(err);
            // }
        });
    });
}


// id's can be self-assigned and used to manage the websocket message received lifecycle
const server_state_id = 2;
const subscribe_transactions_id = 3;
const transactions_id = 4;

const server_state_request_body = {
    "id": server_state_id,
    "command": "server_state",
    "binary": false,
    "ledger_index": "current"
};

function monitorServerState(client, monitorIntervalSeconds = 60) {
    console.log('💁 Setting Up Server State Monitor (%s second interval)', monitorIntervalSeconds);
    sendServerStateRequest(client);
    setInterval(function() {sendServerStateRequest(client)}, monitorIntervalSeconds*1000);
}

function sendServerStateRequest(client) {
    console.log('📨 Sending Server State Request');
    client.send(JSON.stringify(server_state_request_body));
}

function handleServerStateResponse(json_response) {
    console.log(json_response)
    if (json_response['type'] === 'response' && json_response['status'] === 'success') {
        console.log('👍 Received Successful Response');
        const result = json_response['result'];
        if ('warnings' in result)
            for (warning of result['warnings'])
                if (warning['id'] === 1004)
                    true
                else
                    console.log('🔴 Warning: %s', JSON.stringify(warning));
        // console.log('🟢 Response: %s', JSON.stringify(result['state']));
        const state = result['state'];
        const complete_ledgers = state['complete_ledgers'];
        const validated_index = state['validated_ledger']['seq'];
        const dt = new Date();
        const delta = dt - new Date(state['time']);;
        const ledgerClose = new Date((state['validated_ledger']['close_time'] + 946684800)*1000);
        const delta2 = dt - ledgerClose;
        console.log('👌 Server Looks OK 📚 %s ⏰ %s Validation Lag: %sms Response Lag: %sms', complete_ledgers, ledgerClose.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }), delta2, delta);
        delete json_response['warnings']
        return json_response // dblib.insertServerState(client, validated_index, completed_ledgers, JSON.stringify(json_response));
    } else {
        console.log('💀 %s', JSON.stringify(json_response));
    }

};


module.exports = {
    getWsClient, waitForWsClientReady, handleServerStateResponse, monitorServerState
};
