import {cModuleName, Dropletutils, Translate} from "./utils/Dropletutils.js";
import {openNewInput} from "./helpers/popupInput.js";

const cValidDropTypes = ["Item", "ActiveEffect"];
const cNoDeleteTypes = ["ActiveEffect"];

class ItemDropManager {
	//DECLARATIONS
	static InitiateTransfer(pObject, pTarget, vOptions) {} //starts a transfer of pObject to pTarget
	
	static RequestTransfer(pSource, pTarget, pTransferObjects, vOptions) {} //starts a request for a GM to transfer pTransferObject from pSource to pTarget
	
	static async TransferRequest(pData) {} //answers a transfere request (GM only)
	
	static async TransferObjectGM(pSource, pTarget, pTransferObjects, pInfos) {} //transfers an object from pSource to pTarget
	
	static async manageTransferDeletion(pItem, pKeys, pAmount = undefined) {} //manages the delete step of transfer events (and uses the pkey press dependent rules)
	
	//ui
	static createTransferMessage(pUserID, pObject, pSource, pTarget, pAmount = undefined) {} 
	
	//ons
	static onCanvasDrop(pInfos) {} //called when something is dropped on the canvas
	
	static onSheetDrop(pTargetActor, pData) {} //called when an item is droped on an item sheet
	
	//IMPLEMENTATIONS
	static InitiateTransfer(pObject, pTarget, vOptions) {
		if (pObject && pTarget) {
			if (Dropletutils.validTarget(pTarget) && Dropletutils.validObject(pObject)) {
				ItemDropManager.RequestTransfer(pObject.parent, pTarget, [pObject], vOptions);
			}
		}
	}
	
	static RequestTransfer(pSource, pTarget, pTransferObjects, vOptions) {
		if (pSource == pTarget) return;
		
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
	
	static async TransferObjectGM(pSource, pTarget, pTransferObjects, pInfos) {
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
							
							let vAmount = vCopy.system.quantity;
							
							if (vSourceActor) {
								vAmount = await ItemDropManager.manageTransferDeletion(vObject, pInfos.options.keys, pInfos.options.amount);
							}
							
							vCopy.system.quantity = vAmount;
							
							vTargetActor.createEmbeddedDocuments(vObjectType, [vCopy]);
							
							let vInfos = {NoDelete : cNoDelete, ObjectType : vObjectType};
							
							if (game.settings.get(cModuleName, "TransferChatMessage")) {
								ItemDropManager.createTransferMessage(pInfos.userID, vCopy, vSourceActor, vTargetActor, vInfos, vAmount);
							}
						}
					}
				}
			}
		}
	}
	
	static async manageTransferDeletion(pItem, pKeys, pAmount = undefined) {
		if (pItem) {
			let vRequestAmount = (pAmount == undefined) && pItem.system?.quantity > 1 && Boolean(game.settings.get(cModuleName, "askTransferAmount") ^ Boolean(pKeys.CTRL));
			let vDeleteOrigin = pItem.actor && Boolean(game.settings.get(cModuleName, "deleteItemonTransfer") ^ Boolean(pKeys.ALT));
			
			let vAmount = pAmount ?? -1;
			
			if (vRequestAmount) {
				vAmount = await openNewInput("range", Translate("Titles.Transfer"), Translate("Titles.Amount"), {abbortName : Translate("Titles.All"), abbortValue : pItem.system.quantity, abbortIcon : "fa-solid fa-cubes-stacked", defaultValue : Math.floor(pItem.system.quantity/2), min : 0, step : 1, max : pItem.system.quantity});
			}
			
			if (vAmount != 0 && vDeleteOrigin) {
				vAmount = Dropletutils.deleteItem(pItem, vAmount);
			}
			else {
				if (vAmount < 0) {
					vAmount = pItem.system.quantity;
				}
			}
			
			return vAmount;
		}
	}
	
	//ui
	static createTransferMessage(pUserID, pObject, pSource, pTarget, pInfos, pAmount = undefined) {
		if (pObject && pTarget) {
			let vUserName = game.users.get(pUserID).name;
			let vSourceName = pSource?.name;
			let vTargetName = pTarget?.name;
			
			let vFlavor = `	<p>${Translate("ChatMessages.ObjectTransfer." + pInfos.ObjectType + "." + (pInfos.NoDelete ? "NoDelete" : "Delete"), {UserName : vUserName, SourceName : vSourceName, TargetName : vTargetName})}</p>
							<div class="form-group" style="display:flex;flex-direction:row;align-items:center;gap:1em">
								<p>${pAmount && pAmount > 1 ? "(" + pAmount + "*)" : ""}</p>
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
				
				let vAmount;
				let vKeys = Dropletutils.functionKeys();
				
				if (vObject.system?.quantity > 1 && Boolean(game.settings.get(cModuleName, "askTransferAmount") ^ Boolean(vKeys.CTRL))) {
					vAmount = await openNewInput("range", Translate("Titles.Transfer"), Translate("Titles.Amount"), {abbortName : Translate("Titles.All"), abbortValue : vObject.system.quantity, abbortIcon : "fa-solid fa-cubes-stacked", defaultValue : Math.floor(vObject.system.quantity/2), min : 0, step : 1, max : vObject.system.quantity});
					console.log(vAmount);
				}
				
				let vOptions = {keys : vKeys, amount : vAmount};
				
				ItemDropManager.InitiateTransfer(vObject, vTargetToken, vOptions);
			}
		}
	}
	
	static onSheetDrop(pTargetActor, pData) {
		if (game.settings.get(cModuleName, "applytoSheetDrop")) {
			let vUpdateHook;
			let vCreateHook;
		
			let vCall = async () => {
				Hooks.off("updateItem", vUpdateHook);
				Hooks.off("createItem", vCreateHook);
				
				let vKeys = Dropletutils.functionKeys();
				
				if (pTargetActor.isOwner) {
					if (pData.type == "Item") {
						let vSourceItem = await fromUuid(pData.uuid);
						
						if (vSourceItem) {
							let vSourceID = vSourceItem.getFlag("core", "sourceId");
							let vSourceAmount = vSourceItem.system.quantity;
							
							let vTargetItem = pTargetActor?.items.filter(vItem => vItem.getFlag("core", "sourceId") == vSourceItem.uuid || (vSourceID && vItem.getFlag("core", "sourceId") == vSourceID)).pop(); //try to find last added matching item
							
							let vTransfered = await ItemDropManager.manageTransferDeletion(vSourceItem, vKeys);
							
							if (vTargetItem && (vSourceAmount != vTransfered)) {
								//fix amount of transfered items
								vTargetItem.update({system : {quantity : vTargetItem.system.quantity - (vSourceAmount-vTransfered)}});
							}
						}
					}
				}
			}
			
			//wait for update/creation of new item
			vUpdateHook = Hooks.once("updateItem", vCall);
			vCreateHook = Hooks.once("createItem", vCall);
		}
	}
}

Hooks.on("dropCanvasData", (pTarget, pInfos) => {ItemDropManager.onCanvasDrop(pInfos)});

Hooks.on("dropActorSheetData", (pTargetActor, pTargetSheet, pData) => {ItemDropManager.onSheetDrop(pTargetActor, pData)});

export function TransferRequest(pData) {ItemDropManager.TransferRequest(pData)};