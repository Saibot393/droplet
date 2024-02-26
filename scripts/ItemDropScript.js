import {cModuleName, Dropletutils, Translate} from "./utils/Dropletutils.js";

const cValidDropTypes = ["Item", "ActiveEffect"];
const cNoDeleteTypes = ["ActiveEffect"];

class ItemDropManager {
	//DECLARATIONS
	static InitiateTransfer(pObject, pTarget, vOptions) {} //starts a transfer of pObject to pTarget
	
	static RequestTransfer(pSource, pTarget, pTransferObjects, vOptions) {} //starts a request for a GM to transfer pTransferObject from pSource to pTarget
	
	static async TransferRequest(pData) {} //answers a transfere request (GM only)
	
	static TransferObjectGM(pSource, pTarget, pTransferObjects, pInfos) {} //transfers an object from pSource to pTarget
	
	//ui
	static createTransferMessage(pUserID, pObject, pSource, pTarget) {} 
	
	//ons
	static onCanvasDrop(pInfos) {} //called when something is dropped on the canvas
	
	//IMPLEMENTATIONS
	static InitiateTransfer(pObject, pTarget, vOptions) {
		if (pObject && pTarget) {
			if (Dropletutils.validTarget(pTarget) && Dropletutils.validObject(pObject)) {
				ItemDropManager.RequestTransfer(pObject.parent, pTarget, [pObject], vOptions);
			}
		}
	}
	
	static RequestTransfer(pSource, pTarget, pTransferObjects, vOptions) {
		if (game.user.isGM) {
			let vInfos = {};
			
			vInfos.userID = game.user.id;
			
			vInfos.options = vOptions;
			
			ItemDropManager.TransferObjectGM(pSource, pTarget, pTransferObjects, vInfos);
		}
		else {
			let vData = {};
			
			if (pSource) {
				vData.sourceType = pSource?.documentName;
				vData.sourceID = pSource?.id;
				vData.sourceUuid = pSource?.uuid;
				vData.sourceSceneID = pSource?.parent?.id;
			}
			
			if (pTarget) {
				vData.targetType = pTarget?.documentName;
				vData.targetID = pTarget?.id;
				vData.targetUuid = pTarget?.uuid;
				vData.targetSceneID = pTarget?.parent?.id;
			}

			if (pTransferObjects) {
				vData.transferTypes = pTransferObjects?.map(vObject => vObject.documentName);
				vData.transferIDs = pTransferObjects?.map(vObject => vObject.id);
				vData.transferUuids = pTransferObjects?.map(vObject => vObject.uuid);
			}
			
			vData.userID = game.user.id;
			
			vData.options = vOptions;
			
			game.socket.emit("module.droplet", {pFunction : "TransferRequest", pData : vData});
		}
	}
	
	static async TransferRequest(pData) {
		if (game.user.isGM) {
			let vSource = await fromUuid(pData.sourceUuid);
			
			let vTarget = await fromUuid(pData.targetUuid);
			
			
			let vObjects = [];
			
			for (let vUuid of pData.transferUuids) {
				vObjects.push(await fromUuid(vUuid));
			}
			
			let vInfos = {};
			
			vInfos.options = pData.options;
			
			vInfos.userID = pData.userID;
			
			ItemDropManager.TransferObjectGM(vSource, vTarget, vObjects, vInfos);
		}
	}
	
	static TransferObjectGM(pSource, pTarget, pTransferObjects, pInfos) {
		if (game.user.isGM) {
			if (pTarget && pTransferObjects.find(vObject => vObject)) {
				for (let vObject of pTransferObjects.filter(vObject => vObject)) {
					let vObjectType = vObject.documentName;
					
					if (cValidDropTypes.includes(vObjectType)) {
						let vSourceActor = pSource?.actor;
						
						if (!vSourceActor && pSource?.documentName == "Actor") {
							vSourceActor = pSource;
						}
						
						let vTargetActor = pTarget.actor;
						
						if (!vTargetActor && pTarget?.documentName == "Actor") {
							vTargetActor = pTarget;
						}
						
						const cNoDelete = !vSourceActor || cNoDeleteTypes.includes(vObjectType);
						
						if (vTargetActor) {
						
							let vCopy = duplicate(vObject);
							 
							vTargetActor.createEmbeddedDocuments(vObjectType, [vCopy]);
							
							if (vSourceActor && !cNoDelete) {
								if (game.settings.get(cModuleName, "deleteItemonTransfer")) {
									vSourceActor.deleteEmbeddedDocuments(vObjectType, [vObject.id]);
								}
							}
							
							let vInfos = {NoDelete : cNoDelete, ObjectType : vObjectType};
							
							if (game.settings.get(cModuleName, "TransferChatMessage")) {
								ItemDropManager.createTransferMessage(pInfos.userID, vCopy, vSourceActor, vTargetActor, vInfos);
							}
						}
					}
				}
			}
		}
	}
	
	//ui
	static createTransferMessage(pUserID, pObject, pSource, pTarget, pInfos) {
		if (pObject && pTarget) {
			let vUserName = game.users.get(pUserID).name;
			let vSourceName = pSource?.name;
			let vTargetName = pTarget?.name;
			
			let vFlavor = `	<p>${Translate("ChatMessages.ObjectTransfer." + pInfos.ObjectType + "." + (pInfos.NoDelete ? "NoDelete" : "Delete"), {UserName : vUserName, SourceName : vSourceName, TargetName : vTargetName})}</p>
							<div class="form-group" style="display:flex;flex-direction:row;align-items:center;gap:1em">
								<img src="${pObject.img}" style = "height: 2em;">
								<p>${pObject.name}</p>
							</div>`;
			
			ChatMessage.create({user: pUserID, flavor : vFlavor, type : 5}); //CHAT MESSAGE
		}
	} 
	
	//ons
	static async onCanvasDrop(pInfos) {
		if (game.user.isGM || (game.settings.get(cModuleName, "allowPlayerItemTransfer") != "no")) { //not necessary for GMs
			if (cValidDropTypes.includes(pInfos.type)) {
				let vTargetToken = Dropletutils.TokenatPosition(pInfos);
				
				let vObject;

				if (pInfos.uuid) {
					vObject = await fromUuid(pInfos.uuid);
				}
				
				if (!vObject) {
					if (pInfos.actorId && pInfos.itemId) {
						vObject = game.actors.get(pInfos.actorId)?.items.get(pInfos.itemId);
					}
				}
				
				let vOptions = {};
				
				ItemDropManager.InitiateTransfer(vObject, vTargetToken, vOptions);
			}
		}
	}
}

Hooks.on("dropCanvasData", (pTarget, pInfos) => {ItemDropManager.onCanvasDrop(pInfos)});

export function TransferRequest(pData) {ItemDropManager.TransferRequest(pData)};