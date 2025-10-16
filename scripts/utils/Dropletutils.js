import {GeometricUtils} from "./GeometricUtils.js";

const cModuleName = "droplet";

class Dropletutils {
	//DECLARATIONS
	static TokenatPosition(pPosition) {} //returns token at position pPosition, if any
	
	static validTarget(pToken) {} //returns if pToken is a valid drop target
	
	static validObject(pObject) {} //returns if pObject is a valid drop object
	
	//keyboard
	static KeyisDown(pKeys) {} //returns if one of pKeys is pressed
	
	static functionKeys() {} //returns an object storing if any function keys are currently pressed
	
	//items
	static deleteItem(pItem, pQuantity = -1) {} //deletes pItem from its owner actor (or reduces quantity if pQuantity is positive)
	
	static containerContent(pContainer) {} //returns potential container content of pContainer
	
	//IMPLEMENTATIONS
	static TokenatPosition(pPosition) {
		let vToken = canvas.tokens.placeables.map(vToken => vToken.document);
		
		return vToken.find(vToken => GeometricUtils.withinBoundaries(vToken, "TokenFormRectangle", [pPosition.x, pPosition.y]));
	}
	
	static validTarget(pToken) {
		if (game.user.isGM) return true;
		
		switch (game.settings.get(cModuleName, "allowPlayerItemTransfer")) {
			case "no": return false;
			case "ownedonly": return pToken.isOwner;
			case "playersonly": return pToken.actor?.hasPlayerOwner;
			case "friendlies": return pToken.disposition >= 1;
			case "neutrals": return pToken.disposition >= 0;
		}
	}
	
	static validObject(pObject) {
		return pObject.isOwner;
	}
	
	//keyboard
	static KeyisDown(pKeys) {
		let vKeys = Array.isArray(pKeys) ? pKeys : [pKeys];
		
		switch(pKeys) {
			case "ALT":
				vKeys = ["AltLeft", "AltRight"];
				break;
			case "CTRL":
				vKeys = ["ControlLeft", "ControlRight"];
				break;
			case "SHIFT":
				vKeys = ["ShiftLeft", "ShiftRight"];
				break;
		}
		
		return vKeys.find(vKey => game.keyboard.downKeys.has(vKey));
	}
	
	static functionKeys() {
		let vKeys = {};
		
		for (let vkey of ["ALT", "CTRL", "SHIFT"]) {
			vKeys[vkey] = Dropletutils.KeyisDown(vkey);
		}
		
		return vKeys;
	}
	
	//items
	static deleteItem(pItem, pQuantity = -1) {
		let vActor = pItem?.actor;
		
		if (vActor) {
			let vContent = Dropletutils.containerContent(pItem);
			if (vContent?.length) {
				vContent.forEach(vItem => Dropletutils.deleteItem(vItem));
			}
			
			if (pQuantity < 0) {
				let vprevQuantity = pItem.system.quantity;
				
				vActor.deleteEmbeddedDocuments(pItem.documentName, [pItem.id]);
				
				return vprevQuantity;
			}
			
			if (pQuantity > 0) {
				let vprevQuantity = pItem.system.quantity;
				
				let vdeleteQuantity = Math.min(vprevQuantity, pQuantity);
				
				if (vdeleteQuantity == vprevQuantity) {
					//all items removed => delete
					vActor.deleteEmbeddedDocuments(pItem.documentName, [pItem.id]);
				}
				else {
					pItem.update({system : {quantity : vprevQuantity - vdeleteQuantity}});
				}
				
				return vdeleteQuantity;
			}
			
			return 0;
		}
	} 
	
	static containerContent(pContainer) {
		if (pContainer) {
			if (pContainer.system?.contents) {
				return pContainer.system.contents.contents;
			}
			
			if (pContainer.system?.container?.contents) {
				return pContainer.system.container.contents.contents;
			}
			
			if (pContainer.contents) {
				return pContainer.contents.contents;
			}
		}
		
		return false;
	}
}

//for view switching
async function switchScene( {pUserID, pSceneID, px, py} = {}) {
	if ((game.user.id == pUserID) && (canvas.scene.id != pSceneID)) {
		//change only if intended user and not already on target scene
		
		await game.scenes.get(pSceneID)?.view();
		if (px != undefined && py != undefined) {
			canvas.pan({ x: px, y: py });
		}
	}
}

function Translate(pName, pWords = {}){
	let vContent = game.i18n.localize(cModuleName+"."+pName);
	
	for (let vWord of Object.keys(pWords)) {
		vContent = vContent.replace("{" + vWord + "}", pWords[vWord]);
	}
 
	return vContent;
}

export {cModuleName, Dropletutils, switchScene, Translate};