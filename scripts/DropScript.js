import {cModuleName, Dropletutils} from "./utils/Dropletutils.js";

const cValidDropTypes = ["Item", "ActiveEffects"];

class DropManager {
	//DECLARATIONS
	static RequestTransfer(pSource, pTarget, pTransferObject) {} //starts a request for a GM to transfer pTransferObject from pSource to pTarget
	
	static TraferRequest(pData) {} //answers a transfere request (GM only)
	//ons
	static onCanvasDrop(pInfos) {} //called when something is dropped on the canvas
	
	//IMPLEMENTATIONS
	static RequestTransfer(pSource, pTarget, pTransferObject) {
		let vData = {};
		
		if (pSource) {
			vData.sourceType = pSource.documentName;
			vData.sourceID = pSource.id;
			vData.sourceuuid = pSource.uuid;
			vData.sourceSceneID = pSource.parent?.id;
		}
		
		if (pTarget) {
			vData.targetType = pTarget.documentName;
			vData.targetID = pTarget.id;
			vData.targetuuid = pTarget.uuid;
			vData.targetSceneID = pTarget.parent?.id;
		}

		if (pTransferObject) {
			vData.transferType = pTransferObject.documentName;
			vData.transferID = pTransferObject.id;
			vData.transferuuid = pTransferObject.uuid;
		}
		
		vData.userID = this.user.id;

		game.socket.emit("droplet.Rideable"
	}
	
	static TraferRequest(pData) {
		if (game.user.isGM) {
			
		}
	}
	
	//ons
	static onCanvasDrop(pInfos) {
		if (!game.user.isGM || true) { //not necessary for GMs
			if (cValidDropTypes.includes(pInfos.type)) {
				console.log(Dropletutils.TokenatPosition(pInfos))
			}
		}
	}
}

Hooks.on("dropCanvasData", (pTarget, pInfos) => {DropManager.onCanvasDrop(pInfos)});

export function TraferRequest(pData) {DropManager.TraferRequest(pData)};