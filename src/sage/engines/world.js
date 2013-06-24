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
goog.provide("sage.engines.world");
goog.require("sage.utilities.pool");
goog.require("sage.types.entity");
goog.require("sage.types.process");
goog.require("sage.sage");

/** 
 * setup databases for entity system (entity, component, process)
 */
sage.world = (function() {

	var Entity, Process,	
			configuration, pool,
			api = {};

	/**  
	 * clear configuration, clear databases, connect type templates
	 */	
	api.initialize = function worldInitialize(configurationIn) {
				
		configuration = {				
			nextEntityID	: 0,
			nextProcessID	: 0
		};
		
		api.entities 		= TAFFY();
		api.components 	= TAFFY();			
		api.processes 	= TAFFY();
		
		db = api;
		
		Entity	= sage.types.entity;
		Process	= sage.types.process;
		
		configuration = _.extend(configuration, configurationIn);
		return this;
	};
	
	
	/**
	 * create a new entity as blank or from a template
	 * 
	 * @param template create processes for new entity from all components in template
	 * @return entity
	 */
	api.entity = api.spawn = function worldEntitySpawn(script) {
		
		var entity = sage.pool.claim("Entity", Entity);
				
		entity.pkid = configuration.nextEntityID;		
		configuration.nextEntityID = entity.pkid + 1;
		
		db.entities.insert(entity);		
		if (script) {
			sage.includeMany(entity, script);
		}

		return entity;
	};
	
	
	/** 
	 * remove entity from system, along with all processes
	 * 
	 * @param entity entity to kill
	 * @return sage
	 */
	api.kill = function worldEntityKill(entity) {
		
		db.entities({pkid:entity.pkid}).remove();
		sage.pool.yield("Entity", entity);
		
		db.processes({eid:entity.pkid}).each(function (process) {			
			sage.exclude(process);			
		});
		
		return this;
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
		
		var process = sage.process(entity, cid);	
		
		if (!process) {
			return process;
		}
		
		process.startup(initializeWith);
		return this;
	};

	
	/**  
	 * remove process from system
	 * 
	 * @param process an existing process that has been included
	 * @return sage
	 */
	api.exclude = function Exclude(process) {
		
		db.processes({pkid:process.pkid}).remove();									
		process.shutdown();
		sage.pool.yield("Process", process);
		return this;
	};
	
	
	/** 
	 * define a new component
	 *  
	 * @param cid name of component, should be a string
	 * @param component an object with (startup, update, shutdown) all optional
	 * @return sage 
	 */
	api.component = function RegisterComponent(cid, component) {
		
		var alreadyExists = db.components({cid:cid}).first();
		
		if (alreadyExists) {
			return this;
		}
		
		component.pkid = cid;
		db.components.insert(component);		
		return this;
	};
	
	/**  
	 * create a new process
	 * 
	 * @param eid the entity id to add for
	 * @param cid the component type to add to the entity
	 * @return process
	 */
	api.process = function(entity, cid) {
		
		var process 			= false,
				alreadyExists = db.processes({eid:entity.pkid, cid:cid}).first();
		
		if (alreadyExists) {
			return process;
		}
		
		process 						= sage.pool.claim("Process", Process);
		process.pkid 				= configuration.nextProcessID;
		process.eid 				= entity.pkid;
		process.cid 				= cid;
		process.entity 			= entity;
		process.component		= db.components({pkid:cid}).first();
		
		configuration.nextProcessID = process.pkid + 1;
		db.processes.insert(process);
		
		return process;
	};
		
	return api;
	
})();
	