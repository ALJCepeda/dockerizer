var _ = require('underscore');

Object.each = function(self, callback, funcs) {
	Object.find(self, function(key, value, index) { callback(key, value, index); }, funcs);
};

Object.find = function(self, callback, funcs) {
	var index = 0;
	for( var key in self ) {
        if( _.isFunction(self[key]) && funcs !== true ) { continue; }
		if( callback(key, self[key], index) === true ) { return true; }
		index++;
	}
	return false;
};

Object.assign = function(self, data) {
	for(var key in self) {
		if( !_.isUndefined(data[key]) ) { 
          self[key] = data[key]; 
        }
    }
};

Object.merge = function(self, data) {
	Object.each(data, function(key, value) {
		if( _.isFunction(self[key]) ) { return; }
		self[key] = value;
	});
};

Object.map = function(self, callback) {
	var i = 0;
	var result = {};

	Object.each(self, function(key, value, index) {
		if( _.isFunction(value)) { return; }
		var mod = callback(key, value, index);

		if( _.isObject(mod) && !_.isArray(mod) ) {
			result.merge(mod);
		} else {
			result[key] = mod;
		}
	});

	return result;
};