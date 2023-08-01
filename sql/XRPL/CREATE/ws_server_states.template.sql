CREATE TABLE IF NOT EXISTS $1.ws_server_states
(
    insert_id SERIAL,
    insert_ts timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validated_index BIGINT NOT NULL,
    complete_ledgers TEXT NOT NULL,
    server_ts timestamp with time zone NOT NULL,
    validated_ts timestamp with time zone NOT NULL,
    server_json json NOT NULL,
    CONSTRAINT server_states_pkey PRIMARY KEY (insert_id)
);


COMMENT ON TABLE $1.ws_server_states IS 'Websocker Server States. This table is used to store the XRPL WebSocket Server State Responses for this schema''s configuration.';
