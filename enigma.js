/**
 * @author Jane Smith <jsmith@example.com>
 */

"use strict";

// Enigma type 3
// Umkehrwalze = reflector type B or C
// Ringstellung = ring offset between inner and outter ring of the rotor
// Grundstellung = initial position

// /** @constant {object} ENIGMA_REFLECTOR_SETTINGS reflector settings. */
/**
 * Reflector settings.
 * @const {Object} ENIGMA_REFLECTOR_SETTINGS
 * @property {Object} B Type B reflector.
 * @property {string} B.wiring Wiring.
 * @property {Object} C Type C reflector.
 * @property {string} C.wiring Wiring.
 */

const ENIGMA_REFLECTOR_SETTINGS = {	
	"B":	{ "wiring": "yruhqsldpxngokmiebfzcwvjat" },
	"C":	{ "wiring": "fvpjiaoyedrzxwgctkuqsbnmhl" }
};

/** @constant {object} ENIGMA_ROTOR_SETTINGS rotor settings. */
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

/** @constant {object} ENIGMA_DEFAULT_SETTINGS machine default settings for convenience. */
const ENIGMA_DEFAULT_SETTINGS = {
	"plugboard":	{ "wiring": "abcdefghijklmnopqrstuvwxyz" },
	"rotor_right":	{ "type": "III", "offset": "a", "position": "a" },
	"rotor_middle":	{ "type": "II", "offset": "a", "position": "a" },
	"rotor_left":	{ "type": "I", "offset": "a", "position": "a" },
	"reflector":	{ "type": "B" }
};


/** Class representing a rotor. */
class Rotor {

	/**
     * Create a rotor.
     * @param {string} alphabet - The rotor alphabet.
     * @param {string} type - The type of rotor value, valid values are as defined in ENIGMA_ROTOR_SETTINGS.
     * @param {string} offset - The inner ring / outer ring offset, refered by the enigma documentation as "ringstellung". Valid values are symbol of alphabet.
     * @param {string} position - The starting position of a rotor, refered by the enigma documentation as "grundstellung". Valid values are symbol of alphabet.
     */
    constructor(alphabet, type, offset, position) {

		this.alphabet = alphabet;

		this.forward = [];
		this.forward.fill(0, 0, this.alphabet.length - 1);

		this.backward = [];
		this.backward.fill(0, 0, this.alphabet.length - 1);

		this.setup(type, offset, position);
    }

	/**
     * Change the rotor settings.
     * @param {string} type - The type of rotor value.
     * @param {string} offset - The type of rotor value.
     * @param {string} position - The type of rotor value.
     */
	setup(type, offset, position) {

		this.type = type;
		this.wiring = ENIGMA_ROTOR_SETTINGS[type].wiring;
		this.notch = ENIGMA_ROTOR_SETTINGS[type].notch;
		this.offset = this.alphabet.indexOf(offset);
		this.position = this.alphabet.indexOf(position);

		let wiring_index = 0;
		let wiring_count = this.wiring.length;
		while(wiring_index < wiring_count) {
			let offset_wiring1 = (wiring_index - this.offset + 26) % 26;
			let wire = this.wiring[offset_wiring1];
			let offset_wiring2 = (this.alphabet.indexOf(wire) + this.offset) % 26;
			this.forward[wiring_index] = offset_wiring2;
			wiring_index++;
		}

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

	/**
     * Rotate the rotor.
     * @return {boolean} True if the rotor hit a notch, false otherwise.
     */
	rotate() {

		this.position++;
		if(this.position > 25) this.position = 0;

		let letter = this.alphabet[this.position];
		let hit_notch = this.notch.includes(letter);

		return hit_notch;
	}

	/**
     * Feed a letter through the rotor.
     * @param {string} letter - The type of rotor value.
     * @param {string} direction - The type of rotor value.
     * @return {string} The type of rotor value.
     */
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


/** Class This class is used for the plugboard and the reflector although phisically different their function is identical. */
class Mapping {

	/**
     * Create a plugboard or reflector.
     * @param {string} alphabet - The plugboard or reflector alphabet.
     * @param {string} wiring - the mapping of the alphabet to the output.
     */
	constructor(alphabet, wiring) {

		this.alphabet = alphabet;
		this.wiring = wiring;
	}

	/**
     * Change the setup of a plugboard or reflector.
     * @param {string} wiring - the mapping of the alphabet to the output.
     */
	setup(wiring) {

		this.wiring = wiring;
	}

	/**
     * Feed a letter through the plugboard or reflector.
     * @param {string} letter - The letter.
     * @return {string} The output.
     */
	feed(letter) { 

		let index = this.alphabet.indexOf(letter);
		return this.wiring[index];
	}
};


/** Class This class is used for the plugboard and the reflector although phisically different their function is identical. */
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
