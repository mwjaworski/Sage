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
goog.provide("sage.types.process");
goog.require("sage.sage");

/**
 * represents a (entity, component) duple
 */
sage.types.process = (function ProcessDefinition() {
		
	var BLANK_COMPONENT_INITAILIZE_OBJECT = {};
	
	var process = (function Process() {
		
		this.pkid 			= 0;					// primary key of process
		this.eid 				= 0;					// process for entity id
		this.cid 				= 0;					// process runs component id
		this.qid 				= 0;					// process is at queue id (array index)
		this.entity			= undefined;	// entity object
		this.component 	= undefined;	// component object
		this.on					= true;				// process will run component update
		
	});
	
	process.prototype = new (function ProcessPrototype() {
		
		/** use fn to add methods to all processes */
		this.fn = this;

		/** @see sage.kill */
		this.kill = function() {
			
			sage.kill(this.entity);
			return this;
		};
		
		/** @see sage.exclude */
		this.exclude = function() {
			
			sage.exclude(this);
			return this;
		};
		
		/** allow process#run to execute */
		this.play = function() {
			
			this.on = true;
			return this;
		};

		/** prevent process#run from executing */
		this.pause = this.stop = function() {
			
			this.on = false;
			return this;
		};
		
		/** if entity and process are on, then run component */
		this.update = function() {
			
			if (this.entity.on && this.on) {
				
				this.component.update.call(this.entity);
				return true;
			}			
			return false;
		};
		
		this.startup = function(initializeWith) {
			
			initializeWith = (initializeWith !== undefined)
												? initializeWith
												: BLANK_COMPONENT_INITAILIZE_OBJECT;

			if (this.component.startup) {				
				this.component.startup.call(this.entity, initializeWith);	
			}
		};
		
		this.shutdown = function() {
			
			if (this.component.shutdown) {				
				this.component.shutdown.call(this.entity);	
			}			
		};
		
	})();
	
	return process;
	
})();