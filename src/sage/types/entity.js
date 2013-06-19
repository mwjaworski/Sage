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
goog.provide("sage.types.entity");
goog.require("sage.sage");

/**
 * an object defined by the collection of components added to it
 */
sage.types.entity = (function EntityDefinition() {
		
	var entity = (function Entity() {
		
		this.pkid 	= 0;			// primary key of entity
		this.on 		= true;		// entity will allow all included components update (if update exists)
		
	});
	
	entity.prototype = new (function EntityPrototype() {
	
		/** use fn to add methods to all entities */
		this.fn = this;
		
		/** 
		 * a new entity with the same components attached, but without duplicate data 
		 */
		this.clone = function(initializeWithAll) {
			
			var entity = this.spawn();
			
			initializeWithAll = initializeWithAll || {};
			sage.world.processes({eid:this.pkid}).each(function(process) {
							
				sage.include(entity, process.cid, initializeWithAll[process.cid]);				
				
			});
			
			return entity;
		};
		
		/** @see sage.entity */
		this.spawn = function(template) {			
			
			return sage.entity(template);
		};
		
		/** @see sage.kill */
		this.kill = function() {
									
			sage.kill(this);
			return this;
		};
		
		/**
		 * get existing component
		 * 
		 * @param cid component type name
		 * @return component or false if not exists
		 * 
		 */
		this.getComponent = function(cid) {
			
			return sage.query.getComponent(cid);
		};

		/**
		 * get current running process for entity 
		 */
		this.getProcess = function(cid) {
			
			return sage.query.getProcess(this.pkid, cid);
		};
		
		/** 
		 * if component exists, then return or add to entity
		 * 
		 * @see sage.include
		 * @return process for (entity, component)
		 */
		this.include = this.require = function(cid, initializeWith) {			
			
			sage.include(this, cid, initializeWith);
			return this;
		};
				
		/** @see sage#includeMany */
		this.includeMany = function(script) {
			
			sage.includeMany(this, script);
			return this;
		};
		
		/** @see sage.exclude */
		this.exclude = function removeComponent(cid) {
			
			var query 	= {eid:this.pkid, cid:cid},
					process = sage.world.processes(query).first();
			
			sage.exclude(process);
			return this;
		};

		/** @see sage#excludeMany */
		this.excludeMany = function(script) {
			
			sage.excludeMany(this, script);
			return this;
		};
		
		/** start processes and call startup on all components */
		this.restart = this.enable = function() {

			sage.world.processes({eid:this.pkid}).each(function(process) {
				
				if (process.component.startup) {
					process.component.startup.call(process);
				}
				
			});
			
			this.on = true;
			return this;
		};
		
		/** stop all processes and call shutdown on all components */
		this.suspend = this.disable = function() {
			
			sage.world.processes({eid:this.pkid}).each(function(process) {
				
				if (process.component.shutdown) {
					process.component.shutdown.call(process);
				}
				
			});

			this.on = false;
			return this;
		};
		
	})();

	return entity;
	
})();
