import {cModuleName, Dropletutils, switchScene, Translate} from "./utils/Dropletutils.js";

let vDraggedPlayer;

class ItemDropManager {
	//DECLARATIONS
	static onPlayerdrag(pPlayerID) {} //called when a player name is draggedplayer
	
	static onPlayerdragend(pPlayerID) {} //called when a drag event ends

	static onScenedrop(pSceneID) {} //called when something is dropped on a scene nav
	
	//IMPLEMENTATIONS
	static onPlayerdrag(pPlayerID) {
		if (vDraggedPlayer != pPlayerID) {
			vDraggedPlayer = pPlayerID;
		}
	}
	
	static onPlayerdragend(pPlayerID) {
		if (vDraggedPlayer == pPlayerID) {
			vDraggedPlayer = undefined;
		}
	}

	static onScenedrop(pSceneID) {
		if (vDraggedPlayer && pSceneID) {
			let vData = {pUserID : vDraggedPlayer, pSceneID : pSceneID};
			
			if (game.user.id == vDraggedPlayer) {
				switchScene(vData);
			}
			else {
				game.socket.emit("module.droplet", {pFunction : "switchScene", pData : vData});
			}
		}
	}
}


Hooks.on("renderPlayerList", () => {
	if (game.user.isGM) {
		let vPlayerEntries = ui.players._element[0].querySelectorAll(".player");
		
		for (let i = 0; i < vPlayerEntries.length; i++) {
			vPlayerEntries[i].draggable = true;
			
			vPlayerEntries[i].ondrag = (event) => {
				ItemDropManager.onPlayerdrag(vPlayerEntries[i].getAttribute("data-user-id"));
			};
			
			vPlayerEntries[i].ondragend = (event) => {
				ItemDropManager.onPlayerdragend(vPlayerEntries[i].getAttribute("data-user-id"));
			};
		}
	}
});

Hooks.on("renderSceneNavigation", () => {
	if (game.user.isGM) {
		let vSceneEntries = ui.nav._element[0].querySelectorAll("li.nav-item");
		
		for (let i = 0; i < vSceneEntries.length; i++) {
			vSceneEntries[i].ondrop = (event) => {
				ItemDropManager.onScenedrop(vSceneEntries[i].getAttribute("data-scene-id"));
			};
		}
	}
});
