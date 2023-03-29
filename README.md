# xrpl-pg-js

Custom JS clients for XRPL Websocket and gRPC APIS, loading data into PostgreSQL.

## Why?

This code is WIP, and is meant to be used to load live and historic XRPL data.

The goal of this app is to listen for XRPL ledger data that needs to be loaded into a data warehouse, primaily targetting PostgreSQL

## What?

Currently 2 seperare node.js app's

1. `grpc` (WIP) XRPL gRPC API client. Will be used to query ledger and transaction data.
2. `ws_pg` (WIP) XRPL WS API + PostgreSQL client. Will be used to query for server info, and everything else the gRPC API can't access. Also tries to load data into Postgres.

Eventually, the two app's will be combined into one.

## Why use the gRPC API?

gRPC = HTTP2

## Why not use the the RPC API?

RPC = HTTP

The Websocket API does everything the RPC API can, and more - with better networking performance.
