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
goog.provide("sage.core");
//goog.require("sage.engines.world");
//goog.require("sage.engines.kernel");


/**  */
var sage = window.sage = (function SageDefinition() {
	
	var api = {},
			world, kernel, time, pool;
	
	api.version = "0.2.9";	
	api.type = {};	
	
	/**
	 * 
	 */
	api.initialize = function(configuration) {
				
		configuration = configuration || {};
		
		time 		= sage.time;
		pool 		= sage.pool;
		world 	= sage.world;
		kernel 	= sage.kernel;
		
		time.initialize(configuration.time);
		pool.initialize(configuration.pool);
		world.initialize(configuration.db);		
		kernel.initialize(configuration.kernel);		

		// only expose database
		sage.world = new function() {
			
			this.entities 	= world.entities;
			this.components = world.components;
			this.processes 	= world.processes;			
		};
		
		return api;
	};
	
	
	/**
	 * query the world
	 */
	sage.query = {
			
		/** @return component or undefined */
		getComponent: function getComponent(cid) {
			
			return api.components({pkid:cid}).first();
		},
			
		/** @return process or undefined */
		getProcess: function getProcess(eid, cid) {
			
			return api.processes({eid:eid, cid:cid}).first();
		}	
	};
	
	
	/**
	 * 
	 */
	api.component = function RegisterComponent(cid, component) {
		
		if (component.timed !== undefined) {
			component.timed = time.convertTimedProcessFormat(component.timed);
		}
		
		world.component(cid, component);
		return api;
	};
	
	
	/**
	 * 
	 */
	api.process = function(entity, cid) {
		
		var process = world.process(entity, cid);
		process.qid = kernel.add(process);
		return process;
	};
	
	
	/**
	 * 
	 */
	api.entity = api.spawn = function(script) {
		
		return world.spawn(script);
	};
	
	
	/**
	 * 
	 */
	api.kill = function(entity) {
		
		world.kill(entity);
		return api;
	};
	
	
	/**
	 * 
	 */
	api.include = function(entity, cid, initializeWith) {
		
		world.include(entity, cid, initializeWith);
		return api;
	};
	
	
	/**
	 * add a component to an entity - creates a process
	 * 
	 * @param entity entity to run component for
	 * @param cid component name to include for entity
	 * @param initializeWith an object passed to startup of component, otherwise empty object 
	 * @return sage
	 */
	api.include = function Include(entity, cid, initializeWith) {
		
		var process = api.process(entity, cid);	
		
		if (!process) {
			return process;
		}
		
		process.startup(initializeWith);
		return api;
	};
	
	
	/**
	 * add many components listed in an object, every key is the name of the component
	 * 
	 * @see sage.include
	 * @return sage
	 */
	api.includeMany = function IncludeMany(entity, script) {
			
		_.forEach(script, function(initialize, cid) {			
			api.include(entity, cid, initialize);						
		});	
		
		return api;
	};
	
	
	/**
	 * 
	 */
	api.exclude = function Exclude(process) {
		
		kernel.remove(process.qid);
		world.exclude(process);						
		return api;
	};
	
	
	/**
	 * all for entity
	 * some for entity
	 * all components across entities
	 * 
	 */
	api.excludeMany = function ExcludeMany(entity, script) {
			
		_.forEach(script, function(cid) {			
			api.exclude(entity, cid);			
		});	
		
		return api;
	};
	
	
	return api;
	
})();


