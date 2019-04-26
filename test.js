// Tests done against GCHQ implementation, see
// https://github.com/gchq/CyberChef/wiki/Enigma,-the-Bombe,-and-Typex
// https://gchq.github.io/CyberChef/#recipe=Enigma('3-rotor','','','','BDFHJLCPRTXVZNYEIWGAKMUSQO%3CW','C','O','NZJHGRCXMYSWBOUFAIVLPEKQDT%3CAN','G','I','FKQHTLXOCBJSPDZRAMEWNIUYGV%3CAN','N','D','AF%20BV%20CP%20DJ%20EI%20GO%20HY%20KR%20LZ%20MX%20NW%20TQ%20SU','AH%20CO%20DE%20GZ%20IJ%20KM%20LQ%20NY%20PS%20TW',false)&input=aW50aGV5ZWFyaXRvb2tteWRlZ3JlZW9mZG9jdG9yb2ZtZWRpY2luZW9mdGhldW5pdmVyc2l0eW9mbG9uZG9uYW5kcHJvY2VlZGVkdG9uZXRsZXl0b2dvdGhyb3VnaHRoZWNvdXI

"use strict";

let enigmajs = require("./enigma.js");

const TESTS = [{
		"settings": {
			"plugboard":	{ "wiring": "abcdefghijklmnopqrstuvwxyz" },
			"rotor_right":	{ "type": "III", "offset": "a", "position": "a" },
			"rotor_middle":	{ "type": "II", "offset": "a", "position": "a" },
			"rotor_left":	{ "type": "I", "offset": "a", "position": "a" },
			"reflector":	{ "type": "B" }
		},
		"input": "intheyearitookmydegreeofdoctorofmedicineoftheuniversityoflondonandproceededtonetleytogothroughthecour",
		"output": "hqhkrbkxdumhpjaqaztvyphxvvugjmgsuxgrdcetjopnvmepyvalfwebngtxxsrtxohlarzofqeokdmxwbiknhrcgyrvayuyqpwip",
		"description": "This is the default settings test."
	},
	{
		"settings": {
			"plugboard":	{ "wiring": "abcdefghijklmnopqrstuvwxyz" },
			"rotor_right":	{ "type": "VI", "offset": "a", "position": "a" },
			"rotor_middle":	{ "type": "V", "offset": "a", "position": "a" },
			"rotor_left":	{ "type": "IV", "offset": "a", "position": "a" },
			"reflector":	{ "type": "B" }
		},
		"input": "intheyearitookmydegreeofdoctorofmedicineoftheuniversityoflondonandproceededtonetleytogothroughthecour",
		"output": "nqgfbmwcugbgtbgwtopydvmpudaaglbhfakrjhvbcjjiwksgdokidxcvpukyxbadjmvvhymirucwuahynkvlnvtvemxgjmbmxfvsy",
		"description": "Rotors IV, V, VI tests."
	},
	{
		"settings": {
			"plugboard":	{ "wiring": "abcdefghijklmnopqrstuvwxyz" },
			"rotor_right":	{ "type": "VIII", "offset": "a", "position": "a" },
			"rotor_middle":	{ "type": "VII", "offset": "a", "position": "a" },
			"rotor_left":	{ "type": "I", "offset": "a", "position": "a" },
			"reflector":	{ "type": "C" }
		},
		"input": "intheyearitookmydegreeofdoctorofmedicineoftheuniversityoflondonandproceededtonetleytogothroughthecour",
		"output": "fzeevkqrbwfaccyrklctaaivftduzgyhiaafeuddtxbxlclgrhoreemdkdvdjwevpvgxzwcifgzjmjforxcdubjyxxljcyufcschs",
		"description": "Rotors VII, VIII tests."
	},
	{
		"settings": {
			"plugboard":	{ "wiring": "hboedfzajimqkycslrpwuvtxng" },	// plugboard AH CO DE GZ IJ KM LQ NY PS TW
			"rotor_right":	{ "type": "III", "offset": "a", "position": "a" },
			"rotor_middle":	{ "type": "II", "offset": "a", "position": "a" },
			"rotor_left":	{ "type": "I", "offset": "a", "position": "a" },
			"reflector":	{ "type": "B" }
		},
		"input": "intheyearitookmydegreeofdoctorofmedicineoftheuniversityoflondonandproceededtonetleytogothroughthecour",
		"output": "pknzjdfvetomlrldwkfvfctxoktehkrpbkgpvpviscejkkbznghbywaeyptfkgvfowqqbhkjmzeperhsujtkbehggnfvctkesmgjs",
		"description": "Plugboard test."
	},
	{
		"settings": {
			"plugboard":	{ "wiring": "abcdefghijklmnopqrstuvwxyz" },
			"rotor_right":	{ "type": "III", "offset": "n", "position": "a" },
			"rotor_middle":	{ "type": "II", "offset": "g", "position": "a" },
			"rotor_left":	{ "type": "I", "offset": "c", "position": "a" },
			"reflector":	{ "type": "B" }
		},
		"input": "intheyearitookmydegreeofdoctorofmedicineoftheuniversityoflondonandproceededtonetleytogothroughthecour",
		"output": "fhazfmubprsuuvqzennsvpluwqbwsitqkwevskionsjgdzznlvskwjevtanryjlffksgyrgfbwhhsmlukqicklyxgilykdykanxqj",
		"description": "Offsets test."
	},
	{
		"settings": {
			"plugboard":	{ "wiring": "abcdefghijklmnopqrstuvwxyz" },
			"rotor_right":	{ "type": "III", "offset": "a", "position": "n" },
			"rotor_middle":	{ "type": "II", "offset": "a", "position": "g" },
			"rotor_left":	{ "type": "I", "offset": "a", "position": "c" },
			"reflector":	{ "type": "B" }
		},
		"input": "intheyearitookmydegreeofdoctorofmedicineoftheuniversityoflondonandproceededtonetleytogothroughthecour",
		"output": "qicyjlslcdacxwznizdnybjiiwollabxvvrbztgnrogliqvwnbcwhrsflavxrprctksmcoilifhcmioyijhfzmvpliqaoizfrhezu",
		"description": "Positions test."
	},
	{
		"settings": {
			"plugboard":	{ "wiring": "hboedfzajimqkycslrpwuvtxng" },
			"rotor_right":	{ "type": "VIII", "offset": "n", "position": "d" },
			"rotor_middle":	{ "type": "VII", "offset": "g", "position": "i" },
			"rotor_left":	{ "type": "III", "offset": "c", "position": "o" },
			"reflector":	{ "type": "C" }
		},
		"input": "intheyearitookmydegreeofdoctorofmedicineoftheuniversityoflondonandproceededtonetleytogothroughthecour",
		"output": "krqdcobticmkcrrnabvlhskxxwlwrpqadncglpofclkkkgjojypohpqehbavnwbqkrtdkfyojczietbvmrefkdgzjkvqxqvpadydv",
		"description": "All together test."
	}
];


function Run_Tests(tests) {
	
	let machine = new enigmajs.Enigma("abcdefghijklmnopqrstuvwxyz");
	
	let tests_index = 0;
	let tests_count = tests.length;
	while(tests_index < tests_count) {
		
		let test = tests[tests_index];
		machine.setup(test.settings);
		let output = Array.from(test.input).map((letter)=>{ return machine.process(letter); }).join("");
		let result = "";
		if(output === test.output) {
			result = "Success => ";
		}
		else {
			result = "Failure => ";
		}
		result += test.description;
		console.log(result);
		tests_index++;
	}
}


Run_Tests(TESTS);