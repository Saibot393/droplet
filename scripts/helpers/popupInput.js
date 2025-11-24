import {cModuleName} from "../utils/Dropletutils.js";

const timeout = async ms => new Promise(res => setTimeout(res, ms));
	
async function openNewInput(type, title, question, options = {}) {
	let content = `<label>${question}</label>`;
	
	switch (type) {
		case "number" :
		case "text" :
			content = content + `
				<input type="${type}" id="inputresult" ${options.defaultValue != undefined ? "value="+options.defaultValue : ""}>
			`;
			break;
		case "choice" :
			content = content + `<select id="inputresult">`;
								
			for (let key of Object.keys(options.options)) {
				content = content + `<option value="${key}">${options.options[key].label}</option>`;
			}
			
			content = content + `</select>`;
			
			break;
		case "range" :
			content = content + `
				<div style="display:flex;flex-direction:row">
					<input type="range" name="rangeinput" id="inputresult" ${options.defaultValue != undefined ? "value="+options.defaultValue : ""} min="${options.min}" max="${options.max}" step="${options.step ?? 1}">
					<input type="number" id="inputdisplay" style="margin-left:5px;width:40px;text-align:center" disabled></input>
				</div>
				`
			
	}
	
	let inputready = false;
	let inputresult = undefined;
	
	let internalcallback = (html) => {
		switch (type) {
			case "number" :
			case "text" :
			case "range" :
				inputresult = html.find("input#inputresult").val();
				inputready = true;
				break;
			case "choice" :
				inputresult = html.find("select#inputresult").val();
				inputready = true;
				break;
		}
	};
	
	const dialog = new Dialog({
		title: title,
		content: content,
		buttons: {
			accept: {
			  label: game.i18n.localize(cModuleName + ".Titles.accept"),
			  callback: internalcallback,
			  icon: `<i class="fas fa-check"></i>`
			},
			abbort: {
			  label: options.abbortName ?? game.i18n.localize(cModuleName + ".Titles.abbort"),
			  callback: () => {inputresult = options.abbortValue},
			  icon: `<i class="${options.abbortIcon ? options.abbortIcon : "fas fa-times"}"></i>`
			}
		},
		default: "accept"
	});
	
	dialog.render(true);
	
	while (!dialog.rendered) await timeout(50);
	
	if (type == "range") {
		let inputElement;
		let inputDisplay;
		
		if (game.release.generation < 13) {
			inputElement = dialog.element[0].querySelector("#inputresult");
			inputDisplay = dialog.element[0].querySelector("#inputdisplay");	
			
			inputElement.onchange = () => {inputDisplay.value = inputElement.value};
			inputElement.onchange();
		}
		else {
			inputElement = dialog.element.find("#inputresult");
			inputDisplay = dialog.element.find("#inputdisplay");

			inputElement.on("change",() => {inputDisplay.val(Number(inputElement.val()))});
			inputDisplay.val(Number(inputElement.val()));
		}

	}
	
	await timeout(50); //give window time to render
	
	while (inputready === false && dialog?.rendered) await timeout(50);
	
	return inputresult;
}

export { openNewInput };