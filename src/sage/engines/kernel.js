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
goog.provide("sage.engines.kernel");
goog.require("sage.utilities.pool");
goog.provide("sage.utilities.time");
goog.require("sage.types.process");
goog.require("sage.sage");

/**
 * @name process kernel
 * @use run game simulation
 * @note all components will update() will be added and executed
 */
sage.kernel = (function() {

	var ONE_SECOND_MS = 1000, settings, api = {}, time = sage.utilities.time;

	/**
	 * 
	 */
	var configuration = {

		updatesPerSecond: 12,
		workPerSecond: 100,
		on: true
	};

	/**
	 * 
	 */
	var adt = {

		queue: [],
		add: [],
		remove: [],
		operationalIndexZero: 0,
		previous: 0,
		current: 0
	};

	/**
	 * 
	 */
	var scheduler = (function Scheduler() {

		var period, workload, beforeTime, afterTime, timeDelta, timer;

		var api = {};

		/** calculate performance, statistics, timing metrics and execute processes */
		function update() {

			var workAccomplished;

			if (settings.on) {
				return false;
			}

			beforeTime = time.real.now = Date.now();

			runTimedUpdates();
			runOperationalUpdates(workload);
			removeProcesses();
			addProcesses();

			time.real.delta = timeDelta;
			return true;
		}
		;

		/**
		 * 
		 */
		var runTimedUpdates = function() {

			var queue = adt.queue, 
					i = 0, n = adt.operationalIndexZero, 
					process, time = sage.time,
					yield = sage.pool.yield;

			for (; i < n; i++) {

				process = queue[i];
				if (time.processTimeReadyToFire(process)) {
					process.update();
				}
			}
		};

		/**
		 * 
		 */
		var runOperationalUpdates = function(countdown) {

			var queue = adt.queue, 					
					i = adt.current, n = adt.length;

			while (countdown--) {

				(queue[i]).update();

				i += 1;
				if (i >= n) {

					time.game.now += 1;
					i = adt.operationalIndexZero;
				}

				afterTime = Date.now();
				timeDelta = afterTime - beforeTime;
				if (timeDelta > period) {
					break;
				}
			}

			adt.current = i;
			return countdown;
		};

		var removeProcesses = function(queue) {

			var removeList = adt.remove,
					queue = adt.queue, 
					i = 0, n = removeList.length, 
					process, qid;

			for (; i < n; i++) {

				process = removeList[i];
				qid = process.qid;
				
				if (process.timed !== undefined) {
					
					swap(process, queue[adt.operationalIndexZero - 1]);
					adt.operationalIndexZero -= 1;
				}
				
				swap(process, queue[queue.length - 1]);				
				queue.length -= 1;
			}

			adt.remove.length = 0;
		};

		/** */
		var addProcesses = function() {

			var addList = adt.add,
					queue = adt.queue, 
					i = 0, n = addList.length,
					process;
			
			for (; i < n; i++) {

				process = addList[i];
				qid = process.qid;
				
				queue[queue.length] = process;
				process.qid = n;
				
				if (process.timed !== undefined) {
					
					swap(process, queue[adt.operationalIndexZero]);
					adt.operationalIndexZero += 1;
				}
			}

			adt.add.length = 0;
		};

		/** */
		var swap = function(p1, p2) {
			
			var t;
			
			t = p2.qid;
			
			adt.queue[p1.qid] = p2;
			p2.qid = p1.qid;
			
			adt.queue[t] = p1;
			p1.qid = t;			
		};
				
		/**
		 * 
		 */
		api.start = function() {

			period = ONE_SECOND_MS / settings.frameRate;
			afterTime = time.real.start = Date.now();
			workload = settings.workPerSecond;

			clearInterval(timer);
			timer = setInterval(update, period);
		};

		/**
		 * 
		 */
		api.stop = function() {

			clearInterval(timer);
		};

		return api;

	})();

	/**
	 * @param settings assign performance metrics
	 */
	api.initialize = function(settings) {

		adt.queue = [];
		adt.add = [];
		adt.remove = [];
		adt.operationalIndexZero = 0;
		adt.previous = 0;
		adt.current = 0;

		api.settings(configuration);
		api.settings(settings);
		return settings
	};

	/**  */
	api.settings = function(value) {

		if (value) {
			settings = api.settings = _.extend(settings, value);
		}
		return settings;
	}

	/** */
	api.on = function(value) {

		settings.on = (value !== undefined) ? value : settings.on;
		return (settings.on);
	};

	/** (re)start kernel */
	api.start = api.play = function() {

		adt.current = adt.previous;
		settings.on = true;
		scheduler.start();
	};

	/** pause kernel, remember execute position in adt */
	api.pause = function() {

		adt.previous = adt.current;
		settings.on = false;
		scheduler.stop();
	};

	/** stop kernel, on restart begin at first process */
	api.stop = function() {

		adt.previous = 0;
		settings.on = false;
		scheduler.stop();
	};

	/** add process to adt */
	api.add = function(process) {

		adt.add.push(process);
		return qid;
	};

	/** remove process from adt and swap last active process into empty place */
	api.remove = function(object) {

		var process = (object.pkid !== undefined) ? object : adt.queue[object];

		adt.remove.push(process);
		return process;
	};
	
	return api;

})();
