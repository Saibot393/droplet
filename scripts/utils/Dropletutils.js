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
		return pToken.actor?.hasPlayerOwner;
	}
	
	static validObject(pObject) {
		return pObject.isOwner;
	}
}

function Translate(pName, pWords = {}){
	let vContent = Translate(pName);
	
	for (let vWord of Object.keys(pWords)) {
		vContent = vContent.replace("{" + vWord + "}", pWords[vWord]);
	}
 
	return vContent;
}

export {cModuleName, Dropletutils, Translate};