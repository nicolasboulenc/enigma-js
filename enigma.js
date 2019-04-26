"use strict";

// Enigma type 3

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

    constructor(alphabet, type, offset, position) {

		this.alphabet = alphabet;
		this.forward = [];
		this.backward = [];
		// the fill functions dont seem to work?
		this.forward.fill(0, 0, this.alphabet.length - 1);
		this.backward.fill(0, 0, this.alphabet.length - 1);

		// initialised at setup, further down
		this.type = "";
		this.wiring = "";
		this.notch = "";
		this.offset = 0;	// Also know as "ringstellung" ring settings, offset between inner and outter ring of the rotor.
		this.position = 0;	// Also know as "grundstellung" base position.

		this.setup(type, offset, position);
    }

	setup(type, offset, position) {

		this.type = type;
		this.wiring = ENIGMA_ROTOR_SETTINGS[type].wiring;
		this.notch = ENIGMA_ROTOR_SETTINGS[type].notch;
		this.offset = this.alphabet.indexOf(offset);
		this.position = this.alphabet.indexOf(position);

		// build the forward wiring table
		let wiring_index = 0;
		let wiring_count = this.wiring.length;
		while(wiring_index < wiring_count) {
			let offset_wiring1 = (wiring_index - this.offset + 26) % 26;
			let wire = this.wiring[offset_wiring1];
			let offset_wiring2 = (this.alphabet.indexOf(wire) + this.offset) % 26;
			this.forward[wiring_index] = offset_wiring2;
			wiring_index++;
		}

		// build the backward wiring table
		wiring_index = 0;
		wiring_count = this.wiring.length;
		while(wiring_index < wiring_count) {
			let offset_wiring1 = (wiring_index - this.offset + 26) % 26;
			let wire = this.alphabet[offset_wiring1];
			let offset_wiring2 = (this.wiring.indexOf(wire) + this.offset) % 26;
			this.backward[wiring_index] = offset_wiring2;
			wiring_index++;
		}
	}

	rotate() {

		this.position++;
		if(this.position > 25) this.position = 0;

		let letter = this.alphabet[this.position];
		let hit_notch = this.notch.includes(letter);

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


class Mapping {

	constructor(alphabet, wiring) {

		this.alphabet = alphabet;
		this.wiring = wiring;
	}

	setup(wiring) {

		this.wiring = wiring;
	}

	feed(letter) { 

		let index = this.alphabet.indexOf(letter);
		return this.wiring[index];
	}
};


class Enigma {

	constructor(alphabet, settings=null, debug=false) {

		if(settings === null) {
			settings = ENIGMA_DEFAULT_SETTINGS;
		}

		this.alphabet = alphabet;

		this.plugboard = new Mapping(this.alphabet, settings.plugboard.wiring);

		this.rotors = [];
		this.rotors.push(new Rotor(this.alphabet, settings.rotor_right.type, settings.rotor_right.offset, settings.rotor_right.position));
		this.rotors.push(new Rotor(this.alphabet, settings.rotor_middle.type, settings.rotor_middle.offset, settings.rotor_middle.position));
		this.rotors.push(new Rotor(this.alphabet, settings.rotor_left.type, settings.rotor_left.offset, settings.rotor_left.position));

		let reflector_wiring = ENIGMA_REFLECTOR_SETTINGS[settings.reflector.type].wiring;
		this.reflector = new Mapping(this.alphabet, reflector_wiring);

		this.debug = debug;
	}

	setup(settings) {

		this.plugboard.setup(settings.plugboard.wiring);

		this.rotors[0].setup(settings.rotor_right.type, settings.rotor_right.offset, settings.rotor_right.position);
		this.rotors[1].setup(settings.rotor_middle.type, settings.rotor_middle.offset, settings.rotor_middle.position);
		this.rotors[2].setup(settings.rotor_left.type, settings.rotor_left.offset, settings.rotor_left.position);

		let reflector_wiring = ENIGMA_REFLECTOR_SETTINGS[settings.reflector.type].wiring;
		this.reflector.setup(reflector_wiring);
	}

	process(letter) {
	
		let debug = `${letter}`;
		
		// deals with special case of the middle rotor double step
		let middle_rotor = this.rotors[1];
		if(middle_rotor.notch.includes(this.alphabet[middle_rotor.position + 1]) === true) {
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
		
		debug += ` | ${this.alphabet[this.rotors[2].position]} ${this.alphabet[this.rotors[1].position]} ${this.alphabet[this.rotors[0].position]}`;
		if(this.debug === true)	console.log(debug);

		return letter;
	}
}


if(typeof(module.exports) !== "undefined") {
	module.exports = { Enigma };
}
