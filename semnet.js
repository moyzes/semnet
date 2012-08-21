
function QuerySet(db) {
  this.query = {};
  this.db    = db;
  return this;
}

QuerySet.prototype.filter = function(relation, entity) {
    if(this.query[relation]) this.query[relation].push(entity);
    else this.query[relation] = [entity];
    return this;
}

QuerySet.prototype.all = function() {
  var ret = [];
  for(ent in this.db.entities) {
    var loop_count = 0, match_count = 0
    for(relation in this.query) {
      for(entity in this.query[relation]) {
        loop_count++;
        if(this.db.entities[ent][relation] && this.db.entities[ent][relation].indexOf(this.query[relation][entity]) != -1) {
            match_count++;
        }
      }
    }
    if(match_count == loop_count) ret.push(ent);
  }
  return ret;
};

function Semnet() {
  this.entities  = {};
  this.relations = {};
  this.add('is', {opposite: 'contains', transitive: true});
  return this;
}

Semnet.prototype.export = function() {
  return {entities:  this.entities
         ,relations: this.relations
         };
}

Semnet.prototype.import = function(json) {
  if(json.entities) this.entities = json.entities;
  if(json.relations) this.relations = json.relations;
}

Semnet.prototype.add = function(name, options) {
  if(!this.entities[name]) this.entities[name] = {};
  if(!options) return;
  this.relations[name] = {transitive : options.transitive?true:false
                         ,opposite   : options.opposite?options.opposite:false
                         };
  if(options.opposite)
    this.relations[options.opposite] = {transitive : options.transitive?true:false
                                       ,opposite   : name
                                       };
};

Semnet.prototype.q = function() {
  var query = new QuerySet(this);
  return query;
}

Semnet.prototype.fact = function(entity, relation_name, entitx) {
  if(!this.entities[entity]) this.add_entity(entity);
  if(!this.entities[entitx]) this.add_entity(entitx);
  var relation = this.relations[relation_name];
  if(!this.entities[entity][relation_name]) {
    this.entities[entity][relation_name] = [entitx];
  } else {
    this.entities[entity][relation_name].push(entitx);
  }
  if(relation.opposite) {
    if(!this.entities[entitx][relation.opposite]) {
      this.entities[entitx][relation.opposite] = [entity];
    } else {
      this.entities[entitx][relation.opposite].push(entity);
    }
  }
  if(relation.transitive) {
    var relateds = this.entities[entitx][relation_name];
    for(i in relateds) {
      if(relateds[i] == entity || this.entities[entity][relation_name].indexOf(relateds[i]) != -1) continue;
      this.fact(entity, relation_name, relateds[i]);
    }
    relateds = this.entities[entity][relation.opposite];
    for(i in relateds) {
      if(relateds[i] == entitx || this.entities[entitx][relation.opposite].indexOf(relateds[i]) != -1) continue;
      this.fact(entitx, relation.opposite, relateds[i]);
    }
  }
};

var db = new Semnet();

function tests() {
  var util = require('util');
  var db = new Semnet();
  db.add('animal');
  db.add('mammal');
  db.add('dog');
  db.add('cat');
  db.add('lion');
  db.add('elephant');
  db.add('ant');
  db.add('bigger', {opposite: 'smaller', transitive: true});
  db.fact('mammal', 'is', 'animal');
  db.fact('lion', 'bigger', 'cat');
  db.fact('dog', 'bigger', 'cat');
  db.fact('cat', 'bigger', 'ant');
  db.fact('dog', 'smaller', 'elephant');
  db.fact('lion', 'is', 'mammal');
  console.assert(db.entities.dog.bigger.indexOf('ant') >= -1);
  var db2 = new Semnet();
  db2.import(db.export());
  console.assert(util.inspect(db2.export()) == util.inspect(db.export()));
  console.assert(util.inspect(db.q().filter('is', 'mammal').all()) == util.inspect(['lion']));
  console.assert(util.inspect(db.q().filter('is', 'animal').all()) == util.inspect(['mammal', 'lion']));
  console.assert(util.inspect(db.q().filter('contains', 'lion').all()) == util.inspect(['animal', 'mammal']));
  db.fact('dog', 'is', 'mammal');
  db.fact('elephant', 'is', 'mammal');
  db.fact('cat', 'is', 'mammal');
  return db;
}

db = tests();


if(this.require) {
  var repl = require('repl');
  repl.start().context.db = db;
}
