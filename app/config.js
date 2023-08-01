const env = process.env;

const config = {
  db: { /* do not put password or any sensitive info here, done only for demo */
    host: env.DB_HOST || '0.0.0.0',
    port: env.DB_PORT || 4321,
    user: env.DB_USER || 'xrpsql',
    password: env.DB_PASSWORD || 'xrpsql',
    connectionTimeoutMillis: 100000,
    // database: env.DB_NAME || 'postgresql',
  },
  xrpl: {
    mainnet_s1: {
      // id: env.XRPL_MAINNET_ID || 'mainnet_s1',
      ws: {
        url: env.XRPL_MAINNET_WS_URL || 'wss://s1.ripple.com/',
      },
      grpc: {
        url: env.XRPL_MAINNET_GRPC_URL || 's1.ripple.com:50051',
      }
    },
    mainnet_s2: {
      // id: env.XRPL_MAINNET_ID || 'mainnet_s2',
      ws: {
        url: env.XRPL_MAINNET_WS_URL || 'wss://s2.ripple.com/',
      },
      grpc: {
        url: env.XRPL_MAINNET_GRPC_URL || 's2.ripple.com:50051',
      }
    },
    mainnet_p2plive: {
      // id: env.XRPL_MAINNET_ID || 'mainnet_s2',
      ws: {
        url: env.XRPL_MAINNET_WS_URL || 'wss://p2p.livenet.ripple.com:6006/',
      },
      grpc: {
        url: env.XRPL_MAINNET_GRPC_URL || 'p2p.livenet.ripple.com:50051',
      }
    },

  }
};

module.exports = config;
