import {GeometricUtils} from "./GeometricUtils.js";

const cModuleName = "droplet";

class Dropletutils {
	//DECLARATIONS
	static TokenatPosition(pPosition) {} //returns token at position pPosition, if any
	
	//IMPLEMENTATIONS
	static TokenatPosition(pPosition) {
		let vToken = canvas.tokens.placeables.map(vToken => vToken.document);
		
		return vToken.find(vToken => GeometricUtils.withinBoundaries(vToken, "TokenFormRectangle", [pPosition.x, pPosition.y]));
	}
}

export {cModuleName, Dropletutils};