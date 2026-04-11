import {cModuleName, Dropletutils, switchScene, Translate} from "./utils/Dropletutils.js";

let vDraggedPlayer;

class PlayerDropManager {
	//DECLARATIONS
	static onPlayerdrag(pPlayerID) {} //called when a player name is draggedplayer
	
	static onPlayerdragend(pPlayerID) {} //called when a drag event ends

	static onScenedrop(pSceneID) {} //called when something is dropped on a scene nav
	
	static onPlayerDrop(pPlayerID, pSceneID, pLevelID = undefined) {} //called when a player is dropped on a scene ui (nav or item)
	
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
	
	static onPlayerDrop(pPlayerID, pSceneID, pLevelID = undefined) {
		if (pPlayerID && pSceneID) {
			let vData = {pUserID : pPlayerID, pSceneID : pSceneID, pLevelID};
			
			if (game.user.id == pPlayerID) {
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
			
			let vUserID = vPlayerEntries[i].getAttribute("data-user-id");
			
			vPlayerEntries[i].ondragstart = (pEvent) => {
				pEvent.dataTransfer.setData("text/plain", JSON.stringify({
					type : "User",
					userID : vUserID
				}));
			}
			/*
			vPlayerEntries[i].ondrag = (event) => {
				PlayerDropManager.onPlayerdrag(vPlayerEntries[i].getAttribute("data-user-id"));
			};
			
			vPlayerEntries[i].ondragend = (event) => {
				PlayerDropManager.onPlayerdragend(vPlayerEntries[i].getAttribute("data-user-id"));
			};
			*/
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
			vSceneEntries[i].ondrop = (pEvent) => {
				let vSceneID = vSceneEntries[i].getAttribute("data-scene-id");
				
				let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;

				if (vDropData?.type == "User") {
					PlayerDropManager.onPlayerDrop(vDropData.userID, vSceneID);
				}
			}
		}
		
		if (game.release.generation >= 14) {
			let vLevelEntries = ui.nav.element.querySelectorAll("div.scene-level");
			
			for (let i = 0; i < vLevelEntries.length; i++) {
				vLevelEntries[i].ondrop = (pEvent) => {
					let vSceneID = vLevelEntries[i].getAttribute("data-scene-id");
					let vLevelID = vLevelEntries[i].getAttribute("data-level-id");
					
					let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;

					if (vDropData?.type == "User") {
						PlayerDropManager.onPlayerDrop(vDropData.userID, vSceneID, vLevelID);
					}
				}
			}
		}
	}
});

Hooks.on("renderSceneDirectory", () => {
	if (game.user.isGM && game.release.generation >= 13) {
		let vSceneEntries = ui.scenes.element.querySelectorAll("li.scene");
		
		for (let i = 0; i < vSceneEntries.length; i++) {
			vSceneEntries[i].ondrop = (pEvent) => {
				let vSceneID = vSceneEntries[i].getAttribute("data-entry-id");
				
				let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;

				if (vDropData?.type == "User") {
					PlayerDropManager.onPlayerDrop(vDropData.userID, vSceneID);
				}
			}
		}
	}
});
