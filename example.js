"use strict";

let enigma = require("./enigma.js");

const settings = {
	"plugboard":	{ "wiring": "abcdefghijklmnopqrstuvwxyz" },
	"rotor_right":	{ "type": "III", "offset": "a", "position": "a" },
	"rotor_middle":	{ "type": "II", "offset": "a", "position": "a" },
	"rotor_left":	{ "type": "I", "offset": "a", "position": "a" },
	"reflector":	{ "type": "B" } };

// creates a new machine with alphabet
let machine = new enigma.Enigma("abcdefghijklmnopqrstuvwxyz");

// display plaintext message
let message = "helloworld";
console.log(message);

// setup the machine and encode the message
machine.setup(settings);
let cypher = Array.from(message).map((letter)=>{ return machine.process(letter); }).join("");
console.log(cypher);

// re-setup the machine and decode the cypher
machine.setup(settings);
let decoded = Array.from(cypher).map((letter)=>{ return machine.process(letter); }).join("");
console.log(decoded);
