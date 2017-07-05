var prop = require('properties-parser');
var fs = require('fs');

var exports = module.exports = function(path){
  fs.closeSync(fs.openSync(path, 'a'));

  this._path = path;
  this._file = prop.createEditor(path);

  return {
    get: function(mac){
      return _file.get(mac);
    },
    set: function(mac, ip){
      _file.set(mac, ip);
      _file.save();
    }
  }
};
