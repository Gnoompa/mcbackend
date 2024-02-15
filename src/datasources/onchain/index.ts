import { JsonRpcProvider } from "@ethersproject/providers";
import { Configuration, registerProvider } from "@tsed/di";
import { Logger } from "@tsed/logger";
import { ethers } from "ethers";
import { CONTRACTS, ONCHAIN_CONFIG } from "../../config/contracts";

import CollectionManagerAtrifact from "./artifacts/CollectionManager.json";
import CRYOAtrifact from "./artifacts/CryochamberManager.json";
import GameManagerAtrifact from "./artifacts/GameManager.json";
import GEARSAtrifact from "./artifacts/Gears.json";
import MCAtrifact from "./artifacts/MC.json";
import MCLNAtrifact from "./artifacts/MartianColonists.json";
import MissionManagerAtrifact from "./artifacts/MissionManager.json";

export const ONCHAIN_DATA_SOURCE = Symbol.for("OnChainDataSource");
export type ONCHAIN_DATA_SOURCE = { [K in CONTRACTS]: ethers.Contract };

registerProvider<ONCHAIN_DATA_SOURCE>({
  provide: ONCHAIN_DATA_SOURCE,
  type: "onchain:datasource",
  deps: [Configuration, Logger],
  useFactory(configuration: Configuration): ONCHAIN_DATA_SOURCE {
    const onchain_config = configuration.get<ONCHAIN_CONFIG>("onchain");
    const network_config = onchain_config.networks[onchain_config.current_network];

    console.log(network_config)

    const provider = new JsonRpcProvider(network_config.rpc);

    const MSN = new ethers.Contract(
      onchain_config.networks[onchain_config.current_network].contracts["MSN"], //address
      MissionManagerAtrifact.abi,
      provider
    );

    const GM = new ethers.Contract(
      onchain_config.networks[onchain_config.current_network].contracts["GM"], //address
      GameManagerAtrifact.abi,
      provider
    );

    const CM = new ethers.Contract(
      onchain_config.networks[onchain_config.current_network].contracts["CM"], //address
      CollectionManagerAtrifact.abi,
      provider
    );

    const MC = new ethers.Contract(
      onchain_config.networks[onchain_config.current_network].contracts["MC"], //address
      MCAtrifact.abi,
      provider
    );

    const MCLN = new ethers.Contract(
      onchain_config.networks[onchain_config.current_network].contracts["MCLN"], //address
      MCLNAtrifact.abi,
      provider
    );

    const CRYO = new ethers.Contract(
      onchain_config.networks[onchain_config.current_network].contracts["CRYO"], //address
      CRYOAtrifact.abi,
      provider
    );

    const GEARS = new ethers.Contract(
      onchain_config.networks[onchain_config.current_network].contracts["GEARS"], //address
      GEARSAtrifact.abi,
      provider
    );

    return {
      MSN,
      GM,
      CM,
      MC,
      MCLN,
      CRYO,
      GEARS
    };
  }
});
