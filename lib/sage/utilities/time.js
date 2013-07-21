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
goog.require("sage.core");

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
	api.now = function(v) {

		if (v !== undefined) {
			game.now = v;
		}
		
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
	 * 
	 * TODO convert from string format "4s+2ms(23)"
	 * 
	 */
	api.convertTimedProcessFormat = function(profile) {
		
		var convertToMilliseconds = function(units) {
			
			return		(units === "ms") 			? 1
							: (units === "s")				? 1000
							: (units === "min")			? 60000
							: 1;
		};
		
		profile.repeat 		= (profile.repeat === undefined) 
												? -1 : profile.repeat;
		
		profile.rateUnit	= convertToMilliseconds(profile.rateUnit);
		profile.rate 			= (profile.rate === undefined) 
												? 1 : profile.rate;
		
		profile.delayUnit	= convertToMilliseconds(profile.delayUnit);
		profile.delay			= (profile.delay === undefined)
												? 0 : profile.delay;
		
		if (profile.rateUnit) {
			
			profile.rate *= profile.rateUnit;
			delete profile.rateUnit;
		}
		
		if (profile.delayUnit) {
			
			profile.delay *= profile.delayUnit;
			delete profile.delayUnit;
		}

		profile.lastUpdate = Date.now();
		
		return profile;
	};
	
	/**
	 * TODO reconcile units value for calculation
	 * TODO use delay in calculation of process ready to fire
	 */
	api.isProcessReadyToFire = function(process) {
		
		var profile = process.timed;

		if ((real.now - profile.lastUpdate) >= profile.rate) {
			
			if (profile.repeat > 0) {
				profile.repeat -= 1;
			}
			else if (profile.repeat === 0) {
				process.remove();
			}
		
			profile.lastUpdate = real.now;
			return true;
		}
		
		return true;
	};	
	
	return api;

})();
