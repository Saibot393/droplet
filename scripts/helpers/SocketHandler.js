import { TransferRequest } from "../ItemDropScript.js";
import { switchScene } from "../utils/Dropletutils.js";

//execute functions with pData depending on pFunction
function organiseSocketEvents({pFunction, pData} = {}) {
	switch(pFunction) {
		case "TransferRequest":
			TransferRequest(pData);
			break;
		case "switchScene":
			switchScene(pData);
			break;
	}
}

Hooks.once("ready", () => { game.socket.on("module.droplet", organiseSocketEvents); });