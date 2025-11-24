import {cModuleName, Dropletutils, switchScene, Translate} from "./utils/Dropletutils.js";

let vDraggedPlayer;

class PlayerDropManager {
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

function preparePlayerList() {
	if (game.user.isGM) {
		let vPlayerEntries;
				
		if (game.release.generation < 13) {
			vPlayerEntries = ui.players._element[0].querySelectorAll(".player");
		}
		else {
			vPlayerEntries = ui.players.element.querySelectorAll(".player");
		}
		
		for (let i = 0; i < vPlayerEntries.length; i++) {
			vPlayerEntries[i].draggable = true;
			
			vPlayerEntries[i].ondrag = (event) => {
				PlayerDropManager.onPlayerdrag(vPlayerEntries[i].getAttribute("data-user-id"));
			};
			
			vPlayerEntries[i].ondragend = (event) => {
				PlayerDropManager.onPlayerdragend(vPlayerEntries[i].getAttribute("data-user-id"));
			};
		}
	}
}

Hooks.on("renderPlayerList", () => {
	preparePlayerList();
});

Hooks.on("renderPlayers", () => {
	preparePlayerList();
});

Hooks.on("renderSceneNavigation", () => {
	if (game.user.isGM) {
		let vSceneEntries;

		if (game.release.generation < 13) {
			vSceneEntries = ui.nav._element[0].querySelectorAll("li.nav-item");
		}
		else {
			vSceneEntries = ui.nav.element.querySelectorAll("li.scene");
		}
		
		for (let i = 0; i < vSceneEntries.length; i++) {
			vSceneEntries[i].ondrop = (event) => {
				PlayerDropManager.onScenedrop(vSceneEntries[i].getAttribute("data-scene-id"));
			};
		}
	}
});
