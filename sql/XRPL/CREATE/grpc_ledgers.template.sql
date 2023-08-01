CREATE TABLE IF NOT EXISTS $1.grpc_ledgers
(
    insert_id SERIAL,
    insert_ts timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ledger_index BIGINT NOT NULL,
    ledger_json json NOT NULL,
    CONSTRAINT transactions_pkey PRIMARY KEY (ledger_index)
);

COMMENT ON TABLE $1.grpc_ledgers IS 'GRPC Ledgers. This table is used to store the XRPL Ledger Data Responses for this schema''s configuration.';
