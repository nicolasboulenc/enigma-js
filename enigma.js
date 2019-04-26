"use strict";

// Enigma type 3
// Umkehrwalze = reflector type B or C
// Walzenlage = wheels x 3
// Ringstellung = ring offset between inner and outter ring of the rotor
// Grundstellung = initial position

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
	"rotor_right":	{ "type": "III", "offset": "a", "position": "a" },
	"rotor_middle":	{ "type": "II", "offset": "a", "position": "a" },
	"rotor_left":	{ "type": "I", "offset": "a", "position": "a" },
	"reflector":	{ "type": "B" }
};


class Rotor {

    constructor(wiring, notch, offset, position) {

		this.type = "";
		this.alphabet = "abcdefghijklmnopqrstuvwxyz";
		this.wiring = wiring;
		this.position = this.alphabet.indexOf(position);
		this.offset = this.alphabet.indexOf(offset);
		this.notch = notch;

		this.forward = [];
		let wiring_index = 0;
		let wiring_count = this.wiring.length;
		while(wiring_index < wiring_count) {
			let offset_wiring1 = (wiring_index - this.offset + 26) % 26;
			let wire = this.wiring[offset_wiring1];
			let offset_wiring2 = (this.alphabet.indexOf(wire) + this.offset) % 26;
			this.forward.push(offset_wiring2);
			wiring_index++;
		}

		this.backward = [];
		wiring_index = 0;
		wiring_count = this.wiring.length;
		while(wiring_index < wiring_count) {
			let offset_wiring1 = (wiring_index - this.offset + 26) % 26;
			let wire = this.alphabet[offset_wiring1];
			let offset_wiring2 = (this.wiring.indexOf(wire) + this.offset) % 26;
			this.backward.push(offset_wiring2);
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

    feed(letter, direction) { 

		// calculate relative position
		let absolute_position = this.alphabet.indexOf(letter);
		let relative_position = (absolute_position + this.position) % 26;
		
		let relative_wired_position;
		if(direction === "fwd") {
			relative_wired_position = this.forward[relative_position];
		}
		else if(direction === "bwd") {
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


class Enigma {

	constructor(settings=null) {

		if(settings === null) {
			settings = ENIGMA_DEFAULT_SETTINGS;
		}

		let plugboard_wiring = settings.plugboard.wiring;
		this.plugboard = new Plugboard(ENIGMA_ALPHABET, plugboard_wiring);

		this.rotors = [];
		let rotor_type = settings.rotor_right.type;
		let rotor_settings = ENIGMA_ROTOR_SETTINGS[rotor_type];
		this.rotors.push(new Rotor(rotor_settings.wiring, rotor_settings.notch, settings.rotor_right.offset, settings.rotor_right.position));

		rotor_type = settings.rotor_middle.type;
		rotor_settings = ENIGMA_ROTOR_SETTINGS[rotor_type];
		this.rotors.push(new Rotor(rotor_settings.wiring, rotor_settings.notch, settings.rotor_middle.offset, settings.rotor_middle.position));

		rotor_type = settings.rotor_left.type;
		rotor_settings = ENIGMA_ROTOR_SETTINGS[rotor_type];
		this.rotors.push(new Rotor(rotor_settings.wiring, rotor_settings.notch, settings.rotor_left.offset, settings.rotor_left.position));

		let reflector_type = settings.reflector.type;
		let reflector_wiring = ENIGMA_REFLECTOR_SETTINGS[reflector_type].wiring;
		this.reflector = new Reflector(ENIGMA_ALPHABET, reflector_wiring);
	}

	process(letter) {
	
		let debug = `${letter}`;
		
		// deals with special case of the middle rotor double step
		let middle_rotor = this.rotors[1];
		if(ENIGMA_ALPHABET[middle_rotor.position + 1] === middle_rotor.notch) {
			this.rotors[1].rotate();
			this.rotors[2].rotate();
		}

		// rotate right rotors, rotate following rotors if true i.e. hit notch
		let rotor_index = 0;
		let rotor_count = this.rotors.length;
		let rotate = true
		while(rotor_index < rotor_count && rotate === true) {
			
			rotate = this.rotors[rotor_index].rotate();
			rotor_index++;
		}

		
		letter = this.plugboard.feed(letter);
		debug += ` pb ${letter}`;
		
		// On the enigma machine there is a static rotor between the plugboard and the right rotor
		// it doesnt do any scrambling, I've left it out for simplicity

		// feed data through the rotor forward i.e. right to left
		rotor_index = 0;
		rotor_count = this.rotors.length;
		while(rotor_index < rotor_count) {

			letter = this.rotors[rotor_index].feed(letter, "fwd");
			debug += ` r${rotor_index} ${letter}`;
			rotor_index++;
		}
		
		letter = this.reflector.feed(letter);
		debug += ` rf ${letter}`;

		// feed data through the rotor backward i.e. left to right
		rotor_index = 0;
		rotor_count = this.rotors.length;
		while(rotor_index < rotor_count) {

			letter = this.rotors[rotor_count - rotor_index - 1].feed(letter, "bwd");
			debug += ` r${rotor_index} ${letter}`;
			rotor_index++;
		}
		
		letter = this.plugboard.feed(letter);
		debug += ` pb ${letter}`;
		
		debug += ` | ${ENIGMA_ALPHABET[this.rotors[2].position]} ${ENIGMA_ALPHABET[this.rotors[1].position]} ${ENIGMA_ALPHABET[this.rotors[0].position]}`;
		console.log(debug);
		return letter;
	}
}


if(typeof(module.exports) !== "undefined") {
	module.exports = { Enigma };
}
