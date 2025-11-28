const cDCC = "dcc"; //Dungeon Crwal Classic

export class systemutils {
	//DELCARATIONS
	static isystem(pSystem) {} //returns if the current system is pSystem
	
	static savetodeleteonsheetdrop(pItem) {} //returns if it is save to delete pItem after it was dropped in a sheet, necessary for some system specific behavior that deletec droped items automatically
	
	//IMPLEMENTATIONS
	static isystem(pSystem) {
		return game.system.id == pSystem;
	}
	
	static savetodeleteonsheetdrop(pItem) {
		switch (game.system.id) {
			case cDCC:
				return !["weapon", "armor", "equipment", "ammunition", "mount"].includes(pItem.type);
			break;
		}
		
		return true;
	}
}