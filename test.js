let enigma = null;

if(typeof(require) !== "undefined") {
	enigma = require("./enigma.js");
}


// test default settings
function test_minimal() {

	let machine = new enigma.Enigma();
	let message = "a";
	let cypher = message.split("").map((letter)=>{ return machine.process(letter); });
}

// test ???
function test_1() {

	const settings = {
		"plugboard":	{ "wiring": "abcdefwhijtlmnopqrskuvgxyz" },
		"rotor_right":	{ "type": "III", "offset": "a", "position": "a" },
		"rotor_middle":	{ "type": "II", "offset": "a", "position": "a" },
		"rotor_left":	{ "type": "I", "offset": "a", "position": "a" },
		"reflector":	{ "type": "B" }
	};

	let machine = new enigma.Enigma(settings);
	let result = machine.process("t");

	if(result === "g") {
		console.log("Success!");
	}
	else {
		console.log(result);
		console.log("Failed!");
	}
}

// test ???
function test_2(plaintext, cypher) {

	const settings = {
		"plugboard":	{ "wiring": "abcdefghijklmnopqrstuvwxyz" },
		"rotor_right":	{ "type": "III", "offset": "v", "position": "a" },
		"rotor_middle":	{ "type": "II", "offset": "e", "position": "a" },
		"rotor_left":	{ "type": "I", "offset": "q", "position": "a" },
		"reflector":	{ "type": "B" }
	};

	let machine = new enigma.Enigma(settings);
	let message = plaintext;
	let result = message.split("").map((letter)=>{ return machine.process(letter); }).join("");
	console.log(message);
	console.log(result);
	// let result = plaintext.split("").map((letter)=>{ return machine.process(letter); }).join("");
}

const plaintext =  "intheyearitookmydegreeofdoctorofmedicineoftheuniversityoflondonandproceededtonetleytogothroughthecour";
const cypher = "";


if(enigma !== null) {

	// test_minimal();
	// test_1(plaintext, cypher);
	test_2(plaintext, cypher);
}