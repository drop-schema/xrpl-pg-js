-- one schema per url?

CREATE SCHEMA __xrpsql;

CREATE TABLE __xrpsql.url_schema_map 
(
    grpc_url TEXT NOT NULL,
    websocket_url TEXT NOT NULL,
    -- grpc_port INTEGER,
    schema_name TEXT NOT NULL
);

INSERT INTO  __xrpsql.url_schema_map VALUES ('p2p.livenet.ripple.com:50051', 'wss://s2.ripple.com/', 'mainnet');

CREATE SCHEMA mainnet;

CREATE TABLE mainnet.ws_server_states
(
    insert_id SERIAL,
    insert_ts timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    json_data json NOT NULL,
    CONSTRAINT server_states_pkey PRIMARY KEY (insert_id)
);

CREATE TABLE mainnet.grpc_transactions
(
    insert_id SERIAL,
    insert_ts timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    json_data json NOT NULL,
    CONSTRAINT transactions_pkey PRIMARY KEY (insert_id)
);


