import {GeometricUtils} from "./GeometricUtils.js";
import {systemutils} from "./systemutils.js";

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
	static deleteItem(pItem, pQuantity = -1, pCheckDropSavety = false) {} //deletes pItem from its owner actor (or reduces quantity if pQuantity is positive), pCheckDropSavety actiivates system specific savety checks
	
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
	static deleteItem(pItem, pQuantity = -1, pCheckDropSavety = false) {
		let vActor = pItem?.actor;
		
		if (vActor) {
			let vprevQuantity = pItem.system.quantity;
			let vQuantity = pQuantity;
			
			if (vQuantity < 0) {
				vQuantity = vprevQuantity;
			}
			
			if (pCheckDropSavety && !systemutils.savetodeleteonsheetdrop(pItem)) {
				return Math.min(vprevQuantity, vQuantity);
			}
			
			if (vQuantity > 0) {
				let vContent = Dropletutils.containerContent(pItem);
				if (vContent?.length) {
					vContent.forEach(vItem => Dropletutils.deleteItem(vItem));
				}
				
				let vdeleteQuantity = Math.min(vprevQuantity, vQuantity);
				
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