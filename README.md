# Sage
====

Sage is a library for HTML5 game simulation. Sage provides two core solutions:
* a component architecture, whereby entities are collections of components, and components either 
add attributes (data) or behaviors (methods) to entities
* a distributed, asynchronous game loop, whereby processes (behaviors attached to objects) are 
executed via logic or timed events or continuously to drive game logic.


## Example

	sage.initialize();
	sage.entity().component("Walkable").component("Monster");
	sage.component("Monster", {

		startup: function() {
		
			this.health = 100;
			this.strength = 10;
		}
		
		update: function() {
		
			if (this.health < 10) {
			
				// call your code to retreat
			}
		}
		
	});


## Support and Resources

by August 2013 at the latest.