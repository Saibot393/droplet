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
});