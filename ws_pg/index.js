const WebSocket = require('ws');

const dblib = require('./dblib');

const URL = 'wss://s2.ripple.com/';

// id's can be self-assigned and used to manage the websocket message received lifecycle
const server_state_id = 1;
const subscribe_transactions_id = 2;
const transactions_id = 3;

const server_state_request_body = {
    "id": server_state_id,
    "command": "server_state",
    "binary": false,
};

const transactions_request_body = {
    "id": transactions_id,
};

const transcation_subscription_request_body = {
    "id": subscribe_transactions_id,
    "command": "subscribe",
    "streams": ["transactions"],
};

// probably do something later
function handleWarning1004() {
    // do nothing
}


// fixtures/websocket_api_responses/subscribe/transactions_initial.json
function handleSubscribeTransactionResponseInitial(json_response) {
    console.log('📬 Received Initial Transactions Subscription Response');
    subscribed_transactions = true;
}

// fixtures/websocket_api_responses/subscribe/transactions_feed.json
function handleSubscribeTransactionResponseFeed(json_response) {
    // console.log('📬 Received Transactions Subscription Feed');
    console.log('📬 Received %s', json_response['ledger_index']);
    dblib.insertSubscribedTransactions(client, JSON.stringify(json_response));
}


function handleServerStateResponse(json_response) {
    if (json_response['type'] === 'response' && json_response['status'] === 'success') {
        // console.log('👍 Received Successful Response');
        const result = json_response['result'];
        if ('warnings' in result)
            for (warning of result['warnings'])
                if (warning['id'] === 1004)
                    handleWarning1004();
                else
                    console.log('🔴 Warning: %s', JSON.stringify(warning));
        // console.log('🟢 Response: %s', JSON.stringify(result['state']));
        const state = result['state'];
        const complete_ledgers = state['complete_ledgers'];
        const dt = new Date();
        const delta = dt - new Date(state['time']);;
        const ledgerClose = new Date((state['validated_ledger']['close_time'] + 946684800)*1000);
        const delta2 = dt - ledgerClose;
        console.log('👌 Server Looks OK 📚 %s ⏰ %s Validation Lag: %sms Response Lag: %sms', complete_ledgers, ledgerClose.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }), delta2, delta);
        dblib.insertServerState(client, JSON.stringify(json_response));
    } else {
        console.log('💀 %s', JSON.stringify(json_response));
    }

};

function sendServerStateRequest() {
    console.log('📨 Sending Server State Request');
    ws.send(JSON.stringify(server_state_request_body));
}

function sendSubscribeTransactionsRequest() {
    console.log('📨 Sending Transactions Subscription Request');
    ws.send(JSON.stringify(transcation_subscription_request_body));
}


function monitorServerState(monitorIntervalSeconds = 60) {
    console.log('💁 Setting Up Server State Monitor (%s second interval)', monitorIntervalSeconds);
    sendServerStateRequest();
    setInterval(sendServerStateRequest, monitorIntervalSeconds*1000);
}


const ws = new WebSocket(URL);

var client = dblib.getClient();

// Action when we connect to the websocket
ws.on('open', async function open() {
    console.log('👍 XRP Websockets API Connection Successful (host: %s)', ws.url);
    console.log('trying to get pg client')
    client = await dblib.getClient()
    console.log('got pg client');
    // ws.send(JSON.stringify(server_state_request_body));
    monitorServerState();
    sendSubscribeTransactionsRequest();

});

ws.on('message', function message(data) {
    const response = data.toString();
    const json_response = JSON.parse(response);
    const id = json_response['id']
    if (id === 1) {
        handleServerStateResponse(json_response);
    }
    else if (id === 2) {
        handleSubscribeTransactionResponseInitial(json_response);
    }
    else {
        handleSubscribeTransactionResponseFeed(json_response);
    }
  });


