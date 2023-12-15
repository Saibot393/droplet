import {cModuleName, Dropletutils, Translate} from "./utils/Dropletutils.js";

const cValidDropTypes = ["Item", "ActiveEffect"];
const cNoDeleteTypes = ["ActiveEffect"];

class DropManager {
	//DECLARATIONS
	static InitiateTransfer(pObject, pTarget, vOptions) {} //starts a transfer of pObject to pTarget
	
	static RequestTransfer(pSource, pTarget, pTransferObjects, vOptions) {} //starts a request for a GM to transfer pTransferObject from pSource to pTarget
	
	static async TraferRequest(pData) {} //answers a transfere request (GM only)
	
	static TransferObjectGM(pSource, pTarget, pTransferObjects, pInfos) {} //transfers an object from pSource to pTarget
	
	//ui
	static createTransferMessage(pUserID, pObject, pSource, pTarget) {} 
	
	//ons
	static onCanvasDrop(pInfos) {} //called when something is dropped on the canvas
	
	//IMPLEMENTATIONS
	static InitiateTransfer(pObject, pTarget, vOptions) {
		if (pObject && pTarget) {
			if (Dropletutils.validTarget(pTarget) && Dropletutils.validObject(pObject)) {
				DropManager.RequestTransfer(pObject.parent, pTarget, [pObject], vOptions);
			}
		}
	}
	
	static RequestTransfer(pSource, pTarget, pTransferObjects, vOptions) {
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
		
		game.socket.emit("module.droplet", {pFunction : "TraferRequest", pData : vData});
	}
	
	static async TraferRequest(pData) {
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
			
			DropManager.TransferObjectGM(vSource, vTarget, vObjects, vInfos);
		}
	}
	
	static TransferObjectGM(pSource, pTarget, pTransferObjects, pInfos) {
		if (game.user.isGM) {
			if (pTarget && pTransferObjects.find(vObject => vObject)) {
				for (let vObject of pTransferObjects.filter(vObject => vObject)) {
					let vObjectType = vObject.documentName;
					
					if (cValidDropTypes.includes(vObjectType)) {
						const cNoDelete = cNoDeleteTypes.includes(vObjectType);
						
						let vSourceActor = pSource?.actor;
						
						if (!vSourceActor && pSource?.documentName == "Actor") {
							vSourceActor = pSource;
						}
						
						let vTargetActor = pTarget.actor;
						
						if (!vTargetActor && pTarget?.documentName == "Actor") {
							vTargetActor = pTarget;
						}
						
						if (vTargetActor) {
						
							let vCopy = duplicate(vObject);
							 
							vTargetActor.createEmbeddedDocuments(vObjectType, [vCopy]);
							
							if (vSourceActor && !cNoDelete) {
								vSourceActor.deleteEmbeddedDocuments(vObjectType, [vObject.id]);
							}
							
							let vInfos = {NoDelete : cNoDelete, ObjectType : vObjectType};
							
							DropManager.createTransferMessage(vInfos.userID, vCopy, vSourceActor, vTargetActor, vInfos);
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
			
			let vFlavor = `	<p>${Translate("ChatMessage.ObjectTransfer." + pInfos.ObjectType + (vInfos.NoDelete ? "NoDelte" : "Delete"), {pUserName : vUserName, pSourceName : vSourceName, pTargetName : vTargetName})}</p>
							<div class="form-group" style="display:flex;flex-direction:row;align-items:center;gap:1em">
								<img src="${pObject.img}" style = "height: 2em;">
								<p>${pObject.name}}</p>
							</div>`;
			
			ChatMessage.create({{user: pUserID, flavor : vFlavor, type : 5}); //CHAT MESSAGE
		}
	} 
	
	//ons
	static async onCanvasDrop(pInfos) {
		if (!game.user.isGM || true) { //not necessary for GMs
			console.log(pInfos.type);
			if (cValidDropTypes.includes(pInfos.type)) {
				let vTargetToken = Dropletutils.TokenatPosition(pInfos);
				
				let vObject = await fromUuid(pInfos.uuid);
				
				let vOptions = {};
				
				DropManager.InitiateTransfer(vObject, vTargetToken, vOptions);
			}
		}
	}
}

Hooks.on("dropCanvasData", (pTarget, pInfos) => {DropManager.onCanvasDrop(pInfos)});

export function TraferRequest(pData) {DropManager.TraferRequest(pData)};