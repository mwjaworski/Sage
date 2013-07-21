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
goog.provide("sage.utilities.pool");
goog.require("sage.core");

/** 
 * memory pool, used for entity and process creation/destruction
 */
sage.pool = (function SagePool() {
		
	var api = {}, db;
	
	api.initialize = function poolInitialize(configuration) {
		
		db = {};
		return this;
	};
	
	/** 
	 * @param type what kind of object
	 * @param function to create with new, if needed
	 */
	api.claim = function poolClaim(type, Definition, options) {
		
		var list = db[type];
		
		return (list && list.length > 0)			
			? list.pop()
			: new Definition(options);
	};
	
	/** 
	 * @param type what kind of object
	 */
	api.yield = function poolYield(type, existingObject) {
		
		var list = db[type];
		
		if (list === undefined) {
			list = db[type] = [];
		}		
		
		list.push(existingObject);		
		return this;		
	};
	
	return api;
	
})();
	