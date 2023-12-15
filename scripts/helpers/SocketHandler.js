import { TraferRequest } from "../DropScript.js";

//execute functions with pData depending on pFunction
function organiseSocketEvents({pFunction, pData} = {}) {
	switch(pFunction) {
		case "TraferRequest":
			TraferRequest(pData);
			break;
	}
}

Hooks.once("ready", () => { game.socket.on("module.droplet", organiseSocketEvents); });