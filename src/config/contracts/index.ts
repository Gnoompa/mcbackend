export type CONTRACTS = "MSN" | "GM" | "CM" | "MC" | "MCLN" | "CRYO" | "GEARS";
export type NETWORK_NAME = "development" | "hartest" | "fuji" | "harmain" | "mumbai" | "polygon";

export type NETWORK_SETTINGS = {
  rpc: string;
  contracts: { [K in CONTRACTS]: string };
  tokenName: string;
};

export type ONCHAIN_CONFIG = {
  current_network: NETWORK_NAME;
  networks: { [K in NETWORK_NAME]: NETWORK_SETTINGS };
};

export const onchain_config: ONCHAIN_CONFIG = {
  current_network: (process.env.NETWORK as NETWORK_NAME) || "development",
  networks: {
    development: {
      rpc: "http://127.0.0.1:9545",
      contracts: {
        MSN: process.env.MISSION_MANAGER!,
        GM: process.env.GAME_MANAGER!,
        CM: process.env.COLLECTION_MANAGER!,
        MC: process.env.MC!,
        MCLN: process.env.MCLN!,
        CRYO: process.env.CRYO!,
        GEARS: process.env.GEARS!
      },
      tokenName: "CLNY"
    },
    hartest: {
      rpc: "https://api.s0.b.hmny.io",
      contracts: {
        MSN: process.env.MISSION_MANAGER!,
        GM: process.env.GAME_MANAGER!,
        CM: process.env.COLLECTION_MANAGER!,
        MC: process.env.MC!,
        MCLN: process.env.MCLN!,
        CRYO: process.env.CRYO!,
        GEARS: process.env.GEARS!
      },
      tokenName: "CLNY"
    },
    fuji: {
      rpc: "https://api.avax-test.network/ext/bc/C/rpc",
      contracts: {
        MSN: process.env.MISSION_MANAGER!,
        GM: process.env.GAME_MANAGER!,
        CM: process.env.COLLECTION_MANAGER!,
        MC: process.env.MC!,
        MCLN: process.env.MCLN!,
        CRYO: process.env.CRYO!,
        GEARS: process.env.GEARS!
      },
      tokenName: "CLNY"
    },
    harmain: {
      rpc: process.env.NODA || "https://rpc.heavenswail.one",
      contracts: {
        MSN: process.env.MISSION_MANAGER!,
        GM: process.env.GAME_MANAGER!,
        CM: process.env.COLLECTION_MANAGER!,
        MC: process.env.MC!,
        MCLN: process.env.MCLN!,
        CRYO: process.env.CRYO!,
        GEARS: process.env.GEARS!
      },
      tokenName: "CLNY"
    },
    mumbai: {
      rpc: process.env.MUMBAI_RPC_URL || "https://matic-mumbai.chainstacklabs.com",
      contracts: {
        MSN: process.env.MISSION_MANAGER!,
        GM: process.env.GAME_MANAGER!,
        CM: process.env.COLLECTION_MANAGER!,
        MC: process.env.MC!,
        MCLN: process.env.MCLN!,
        CRYO: process.env.CRYO!,
        GEARS: process.env.GEARS!
      },
      tokenName: "pCLNY"
    },
    polygon: {
      rpc:
        process.env.RPC_POLYGON_URL && process.env.RPC_POLYGON_KEY
          ? `${process.env.RPC_POLYGON_URL}${process.env.RPC_POLYGON_KEY}`
          : "https://polygon-rpc.com",
      contracts: {
        MSN: process.env.MISSION_MANAGER!,
        GM: process.env.GAME_MANAGER!,
        CM: process.env.COLLECTION_MANAGER!,
        MC: process.env.MC!,
        MCLN: process.env.MCLN!,
        CRYO: process.env.CRYO!,
        GEARS: process.env.GEARS!
      },
      tokenName: "pCLNY"
    }
  }
};
