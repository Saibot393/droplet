import {cModuleName, Translate} from "../utils/Dropletutils.js";

Hooks.once("init", () => {  // game.settings.get(cModuleName, "")
  //Settings
  game.settings.register(cModuleName, "TransferChatMessage", {
	name: Translate("Settings.TransferChatMessage.name"),
	hint: Translate("Settings.TransferChatMessage.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true
  }); 
  
  game.settings.register(cModuleName, "allowPlayerItemTransfer", {
	name: Translate("Settings.allowPlayerItemTransfer.name"),
	hint: Translate("Settings.allowPlayerItemTransfer.descrp"),
	scope: "world",
	config: true,
	type: String,
	choices: {
		"no" : Translate("Settings.allowPlayerItemTransfer.options.no"),
		"ownedonly" : Translate("Settings.allowPlayerItemTransfer.options.ownedonly"),
		"playersonly" : Translate("Settings.allowPlayerItemTransfer.options.playersonly"),
		"friendlies" : Translate("Settings.allowPlayerItemTransfer.options.friendliesonly"),
		"neutrals" : Translate("Settings.allowPlayerItemTransfer.options.neutrals")
	},
	default: "playersonly"
  }); 
  
  game.settings.register(cModuleName, "deleteItemonTransfer", {
	name: Translate("Settings.deleteItemonTransfer.name"),
	hint: Translate("Settings.deleteItemonTransfer.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true
  }); 
  
  game.settings.register(cModuleName, "askTransferAmount", {
	name: Translate("Settings.askTransferAmount.name"),
	hint: Translate("Settings.askTransferAmount.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true
  }); 
  
  game.settings.register(cModuleName, "transferZeros", {
	name: Translate("Settings.transferZeros.name"),
	hint: Translate("Settings.transferZeros.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true
  }); 
  
  game.settings.register(cModuleName, "applytoSheetDrop", {
	name: Translate("Settings.applytoSheetDrop.name"),
	hint: Translate("Settings.applytoSheetDrop.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true
  }); 
});