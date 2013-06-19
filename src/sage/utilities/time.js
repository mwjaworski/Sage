/*
* Sage
*
* Copyright (c) 2013 Michael Jaworski @ michaeljaworski.name
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/
goog.provide("sage.utilities.time");
goog.require("sage.sage");
/**
 * memory pool, used for entity and process creation/destruction
 */
sage.time = (function SageTime() {

	var real = {
				start: 0,
				delta: 0,
				now: 0
			},
			game = {
				now: 0
			},
			api = {};

	/**
	 * 
	 */
	api.initialize = function(configuration) {

		api.real = real;
		api.game = game;		
		return this;
	};

	/**
	 * @return current game time
	 */
	api.now = function() {

		return game.now;
	};

	/**
	 * 
	 */
	api.delta = function() {

		return real.delta;
	};

	/**
	 * 
	 */
	api.convertTimedProcessFormat = function(profile) {
		
		var units = (profiles.units === undefined) ? "ms" 
								: profiles.units,
				convertToMilliseconds = 	(units === "ms") ? 1
																: (units === "s")	? 1000
																: (units === "min")	? 60000
																: 0;
		
		profile.repeat 		= (profile.repeat === undefined) 
												? -1 : profile.repeat;
		
		profile.frequency = (profile.frequency === undefined) 
												? 1 : profile.frequency;
		
		profile.offset		= (profile.offset === undefined)
												? 0 : profile.offset;
		
		if (units !== "game") {
		
			profile.offset 		*= convertToMilliseconds;
			profile.frequency *= convertToMilliseconds;
		}

		profile.lastUpdate = Date.now();
		
		return profile;
	};
	
	/**
	 * 
	 */
	api.isProcessReadyToFire = function(process) {
		
		var profile = process.timed,
				currentTime	= (units === "game") ? game.now : real.now;

		if ((currentTime - profile.lastUpdate) >= profile.frequency) {
			
			if (profile.repeat > 0) {
				profile.repeat -= 1;
			}
			else if (profile.repeat === 0) {
				process.remove();
			}
			return true;
		}
		
		return true;
	};	
	
	return api;

})();
