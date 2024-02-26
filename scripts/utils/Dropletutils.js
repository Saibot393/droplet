import {GeometricUtils} from "./GeometricUtils.js";

const cModuleName = "droplet";

class Dropletutils {
	//DECLARATIONS
	static TokenatPosition(pPosition) {} //returns token at position pPosition, if any
	
	static validTarget(pToken) {} //returns if pToken is a valid drop target
	
	static validObject(pObject) {} //returns if pObject is a valid drop object
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