var sage={core:{}},sage=window.sage=function(){var b={},a,e,c,d;b.version="0.2.9";b.type={};b.initialize=function(i){i=i||{};c=sage.time;d=sage.pool;a=sage.world;e=sage.kernel;c.initialize(i.time);d.initialize(i.pool);a.initialize(i.db);e.initialize(i.kernel);sage.world=new function(){this.entities=a.entities;this.components=a.components;this.processes=a.processes};return b};sage.query={getComponent:function(a){return b.components({pkid:a}).first()},getProcess:function(a,c){return b.processes({eid:a,
cid:c}).first()}};b.component=function(i,d){void 0!==d.timed&&(d.timed=c.convertTimedProcessFormat(d.timed));a.component(i,d);return b};b.process=function(b,c){var d=a.process(b,c);d.qid=e.add(d);return d};b.entity=b.spawn=function(d){return a.spawn(d)};b.kill=function(d){a.kill(d);return b};b.include=function(d,c,e){a.include(d,c,e);return b};b.include=function(a,d,c){a=b.process(a,d);if(!a)return a;a.startup(c);return b};b.includeMany=function(a,d){_.forEach(d,function(d,c){b.include(a,c,d)});return b};
b.exclude=function(d){e.remove(d.qid);a.exclude(d);return b};b.excludeMany=function(a,d){_.forEach(d,function(d){b.exclude(a,d)});return b};return b}();sage.utilities={};sage.utilities.time={};
sage.time=function(){var b={start:0,delta:0,now:0},a={now:0},e={initialize:function(){e.real=b;e.game=a;return this},now:function(c){void 0!==c&&(a.now=c);return a.now},delta:function(){return b.delta},convertTimedProcessFormat:function(a){var d=function(a){return"ms"===a?1:"s"===a?1E3:"min"===a?6E4:1};a.repeat=void 0===a.repeat?-1:a.repeat;a.rateUnit=d(a.rateUnit);a.rate=void 0===a.rate?1:a.rate;a.delayUnit=d(a.delayUnit);a.delay=void 0===a.delay?0:a.delay;a.rateUnit&&(a.rate*=a.rateUnit,delete a.rateUnit);
a.delayUnit&&(a.delay*=a.delayUnit,delete a.delayUnit);a.lastUpdate=Date.now();return a},isProcessReadyToFire:function(a){var d=a.timed;b.now-d.lastUpdate>=d.rate&&(0<d.repeat?d.repeat-=1:0===d.repeat&&a.remove(),d.lastUpdate=b.now);return!0}};return e}();sage.utilities.pool={};sage.pool=function(){var b={},a;b.initialize=function(){a={};return this};b.claim=function(b,c,d){return(b=a[b])&&0<b.length?b.pop():new c(d)};b.yield=function(b,c){var d=a[b];void 0===d&&(d=a[b]=[]);d.push(c);return this};return b}();sage.types={};
sage.types.process=function(){var b={},a=function(){this.qid=this.cid=this.eid=this.pkid=0;this.component=this.entity=void 0;this.on=!0};a.prototype=new function(){this.fn=this;this.kill=function(){sage.kill(this.entity);return this};this.exclude=function(){sage.exclude(this);return this};this.play=function(){this.on=!0;return this};this.pause=this.stop=function(){this.on=!1;return this};this.update=function(){return this.entity.on&&this.on?(this.component.update.call(this.entity),!0):!1};this.startup=
function(a){a=void 0!==a?a:b;this.component.startup&&this.component.startup.call(this.entity,a)};this.shutdown=function(){this.component.shutdown&&this.component.shutdown.call(this.entity)}};return a}();sage.engines={};sage.engines.kernel={};
sage.kernel=function(){var b,a={},e,c={updatesPerSecond:2,workPerSecond:100,on:!0},d=[],i=[],g=[],j=0,n=0,l=0,y=function(){if(!1===b.on)return w(),!1;u=e.real.now=Date.now();console.log("update: "+e.real.now);for(var a,c=d,h=0,k=j,f=sage.time;h<k;h++)a=c[h],f.processTimeReadyToFire(a)&&a.update();a=v;c=l;h=d;f=k=h.length;if(0!==k){for(;a--;){h[c].update();c+=1;c>=k&&(e.game.now+=1,c=j);f-=1;if(0>=f)break;p=Date.now();q=p-u;if(q>0.75*r)break}l=c}a=void 0;c=g;a=d;h=0;for(k=c.length;h<k;h++)f=c[h],f.qid&&
(void 0!==f.timed&&(s(f,a[j-1]),j-=1),s(f,a[a.length-1]),a.length-=1,delete f.qid);g.length=0;a=i;c=d;h=0;for(k=a.length;h<k;h++)f=a[h],f.component.update&&(f.qid=c.length,c[f.qid]=f,void 0!==f.timed&&(s(f,c[j]),j+=1));i.length=0;e.real.delta=q;return!0},r,v,u,p,q,t,m={},s=function(a,b){var c;c=b.qid;d[a.qid]=b;b.qid=a.qid;d[c]=a;a.qid=c};m.start=function(){r=1E3/b.updatesPerSecond;p=e.real.start=Date.now();v=b.workPerSecond;clearInterval(t);t=setInterval(y,r)};var w=m.stop=function(){clearInterval(t)};
a.initialize=function(x){e=sage.time;d=[];i=[];g=[];l=n=j=0;b=_.extend({},c);a.settings(x);return b};a.settings=function(a){a&&(b=_.extend(b,a));return b};a.on=function(a){b.on=void 0!==a?a:b.on;return b.on};a.start=a.play=function(){l=n;b.on=!0;m.start()};a.pause=function(){n=l;b.on=!1;m.stop()};a.stop=function(){n=0;b.on=!1;m.stop()};a.add=function(a){if(void 0===a.component.update&&void 0===a.component.tick)return!1;i.push(a);return!0};a.remove=function(a){a=void 0!==a.pkid?a:d[a];g.push(a);return a};
return a}();sage.types.entity=function(){var b=function(){this.pkid=0;this.on=!0};b.prototype=new function(){this.fn=this;this.clone=function(a){var b=this.spawn(),a=a||{};sage.world.processes({eid:this.pkid}).each(function(c){sage.include(b,c.cid,a[c.cid])});return b};this.spawn=function(a){return sage.entity(a)};this.kill=function(){sage.kill(this);return this};this.getComponent=function(a){return sage.query.getComponent(a)};this.getProcess=function(a){return sage.query.getProcess(this.pkid,a)};this.include=
this.require=function(a,b){sage.include(this,a,b);return this};this.includeMany=function(a){sage.includeMany(this,a);return this};this.exclude=function(a){a=sage.world.processes({eid:this.pkid,cid:a}).first();sage.exclude(a);return this};this.excludeMany=function(a){sage.excludeMany(this,a);return this};this.restart=this.enable=function(){sage.world.processes({eid:this.pkid}).each(function(a){a.component.startup&&a.component.startup.call(a)});this.on=!0;return this};this.suspend=this.disable=function(){sage.world.processes({eid:this.pkid}).each(function(a){a.component.shutdown&&
a.component.shutdown.call(a)});this.on=!1;return this}};return b}();sage.engines.world={};
sage.world=function(){var b,a,e,c={initialize:function(d){e={nextEntityID:0,nextProcessID:0};c.entities=TAFFY();c.components=TAFFY();c.processes=TAFFY();db=c;b=sage.types.entity;a=sage.types.process;e=_.extend(e,d);return this}};c.entity=c.spawn=function(a){var c=sage.pool.claim("Entity",b);c.pkid=e.nextEntityID;e.nextEntityID=c.pkid+1;db.entities.insert(c);a&&sage.includeMany(c,a);return c};c.kill=function(a){db.entities({pkid:a.pkid}).remove();sage.pool.yield("Entity",a);db.processes({eid:a.pkid}).each(function(a){sage.exclude(a)});return this};
c.include=function(a,b,c){a=sage.process(a,b);if(!a)return a;a.startup(c);return this};c.exclude=function(a){db.processes({pkid:a.pkid}).remove();a.shutdown();sage.pool.yield("Process",a);return this};c.component=function(a,b){if(db.components({cid:a}).first())return this;b.pkid=a;db.components.insert(b);return this};c.process=function(b,c){var g=db.processes({eid:b.pkid,cid:c}).first();if(g)return g;g=sage.pool.claim("Process",a);g.pkid=e.nextProcessID;g.eid=b.pkid;g.cid=c;g.entity=b;g.component=
db.components({pkid:c}).first();e.nextProcessID=g.pkid+1;db.processes.insert(g);return g};return c}();sage.sage={};

/* Sage version 0.1.0 in utf-8 */