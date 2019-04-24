"use strict";

// Enigma type 3
// Umkehrwalze = reflector type B or C
// Walzenlage = wheels x 3
// Ringstellung = ring offset between inner and outter ring of the rotor
// Grundstellung = initial position

class Rotor {

	static forward() { return true; }
	static backward() { return false; }

    constructor(wiring, notch, offset, base) {

		this.type = "";
		this.alphabet = "abcdefghijklmnopqrstuvwxyz";
		this.wiring = wiring;
		this.position = 0;
		this.offset = 0;
		this.notch = notch;

		this.forward = [];
		let wiring_index = 0;
		let wiring_count = this.wiring.length;
		while(wiring_index < wiring_count) {
			let wire = this.wiring[wiring_index];
			this.forward.push(this.alphabet.indexOf(wire));
			wiring_index++;
		}

		this.backward = [];
		wiring_index = 0;
		wiring_count = this.wiring.length;
		while(wiring_index < wiring_count) {
			let wire = this.alphabet[wiring_index];
			this.backward.push(this.wiring.indexOf(wire));
			wiring_index++;
		}
    }

	rotate() {

		this.position++;
		if(this.position > 25) this.position = 0;

		let notch_position = this.alphabet.indexOf(this.notch);
		let hit_notch = (this.position === notch_position);

		return hit_notch;
	}

    feed(letter, direction=Rotor.forward) { 

		// calculate relative position
		let absolute_position = this.alphabet.indexOf(letter);
		let relative_position = (absolute_position + this.position) % 26;
		
		let relative_wired_position = this.forward[relative_position];
		if(direction === Rotor.backward) {
			relative_wired_position = this.backward[relative_position];
		}

		// calculate absolute
		let absolute_wired_position = (relative_wired_position - this.position + this.alphabet.length) % 26;
		let absolute_wired_letter = this.alphabet[absolute_wired_position];

		return absolute_wired_letter;
	}
};


class Reflector {

	constructor(alphabet, wiring) {

		this.alphabet = alphabet;
		this.wiring = wiring;
	}

	feed(letter) { 

		let index = this.alphabet.indexOf(letter);
		return this.wiring[index];
	}
};


class Plugboard {

	constructor(alphabet, wiring) {

		this.alphabet = alphabet;
		this.wiring = wiring;
	}

	wire(letter1, letter2) {

		let index1 = this.alphabet.indexOf(letter1);
		let index2 = this.alphabet.indexOf(letter2);

		this.wiring[index1] = letter2;
		this.wiring[index2] = letter1;
	}

	feed(letter) { 

		let index = this.alphabet.indexOf(letter);
		return this.wiring[index];
	}
};


class Static_Rotor {

	// constructor() {}
	feed(letter) { return letter; }
};


const ENIGMA_ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const ENIGMA_REFLECTOR_SETTINGS = {	
	"B":	{ "wiring": "yruhqsldpxngokmiebfzcwvjat" },
	"C":	{ "wiring": "fvpjiaoyedrzxwgctkuqsbnmhl" }
};
const ENIGMA_ROTOR_SETTINGS = {	
	"I":	{ "wiring": "ekmflgdqvzntowyhxuspaibrcj", "notch": "r" },
	"II":	{ "wiring": "ajdksiruxblhwtmcqgznpyfvoe", "notch": "f" },
	"III":	{ "wiring": "bdfhjlcprtxvznyeiwgakmusqo", "notch": "w" },
	"IV":	{ "wiring": "esovpzjayquirhxlnftgkdcmwb", "notch": "k" },
	"V":	{ "wiring": "vzbrgityupsdnhlxawmjqofeck", "notch": "a" },
	"VI":	{ "wiring": "jpgvoumfyqbenhzrdkasxlictw", "notch": "an" },
	"VII":	{ "wiring": "nzjhgrcxmyswboufaivlpekqdt", "notch": "an" },
	"VIII":	{ "wiring": "fkqhtlxocbjspdzramewniuygv", "notch": "an" } 
};
const ENIGMA_DEFAULT_SETTINGS = {
	"plugboard":	{ "wiring": "abcdefghijklmnopqrstuvwxyz" },
	"rotor_right":	{ "type": "III", "offset": "0", "base": "0" },
	"rotor_middle":	{ "type": "II", "offset": "0", "base": "0" },
	"rotor_left":	{ "type": "I", "offset": "0", "base": "0" },
	"reflector":	{ "type": "B" }
};

class Enigma {

	constructor() {

		let plugboard_wiring = ENIGMA_DEFAULT_SETTINGS.plugboard.wiring;
		this.plugboard = new Plugboard(ENIGMA_ALPHABET, plugboard_wiring);

		this.static_rotor = new Static_Rotor();

		this.rotors = [];
		let rotor_type = ENIGMA_DEFAULT_SETTINGS.rotor_right.type;
		let rotor_settings = ENIGMA_ROTOR_SETTINGS[rotor_type];
		this.rotors.push(new Rotor(rotor_settings.wiring, rotor_settings.notch, ENIGMA_DEFAULT_SETTINGS.rotor_right.offset, ENIGMA_DEFAULT_SETTINGS.rotor_right.base));

		rotor_type = ENIGMA_DEFAULT_SETTINGS.rotor_middle.type;
		rotor_settings = ENIGMA_ROTOR_SETTINGS[rotor_type];
		this.rotors.push(new Rotor(rotor_settings.wiring, rotor_settings.notch, ENIGMA_DEFAULT_SETTINGS.rotor_middle.offset, ENIGMA_DEFAULT_SETTINGS.rotor_middle.base));

		rotor_type = ENIGMA_DEFAULT_SETTINGS.rotor_left.type;
		rotor_settings = ENIGMA_ROTOR_SETTINGS[rotor_type];
		this.rotors.push(new Rotor(rotor_settings.wiring, rotor_settings.notch, ENIGMA_DEFAULT_SETTINGS.rotor_left.offset, ENIGMA_DEFAULT_SETTINGS.rotor_left.base));

		let reflector_type = ENIGMA_DEFAULT_SETTINGS.reflector.type;
		let reflector_wiring = ENIGMA_REFLECTOR_SETTINGS[reflector_type].wiring;
		this.reflector = new Reflector(ENIGMA_ALPHABET, reflector_wiring);
	}

	process(letter) {
	
		let debug = `${letter}`;

		// rotate right rotors, rotate following rotors if true i.e. hit notch
		let rotor_index = 0;
		let rotor_count = this.rotors.length;
		let rotate = true
		while(rotor_index < rotor_count && rotate === true) {

			rotate = this.rotors[rotor_index].rotate()
			rotor_index++;
		}
		
		letter = this.plugboard.feed(letter);
		debug += ` pb ${letter}`;
		
		letter = this.static_rotor.feed(letter);
		debug += ` sr ${letter}`;

		rotor_index = 0;
		rotor_count = this.rotors.length;
		while(rotor_index < rotor_count) {

			letter = this.rotors[rotor_index].feed(letter, Rotor.forward)
			debug += ` r${rotor_index} ${letter}`;
			rotor_index++;
		}
		
		letter = this.reflector.feed(letter);
		debug += ` rf ${letter}`;

		rotor_index = 0;
		rotor_count = this.rotors.length;
		while(rotor_index < rotor_count) {

			letter = this.rotors[rotor_index].feed(letter, Rotor.backward)
			debug += ` r${rotor_index} ${letter}`;
			rotor_index++;
		}
		
		letter = this.static_rotor.feed(letter);
		debug += ` sr ${letter}`;
		
		letter = this.plugboard.feed(letter);
		debug += ` pb ${letter}`;
		
		console.log(debug);
		return letter;
	}
}

let machine = new Enigma();

let message = "aaaaaaaaaaaaaaaaaaaaaaaaaa";
let cypher = message.split("").map((letter)=>{ return machine.process(letter); });
console.log(cypher.join(""));
