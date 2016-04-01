/* jslint node: true */
'use strict';


var _each = require('lodash/each');
var _map = require('lodash/map');
var _findIndex = function(array, predicate) {
  var length = array.length >>> 0;
  for (var i = 0; i < length; i++) {
    if (predicate.call(arguments[1], array[i], i, array)) {
      return i;
    }
  }
  return -1;
};

function FontWrapper(pdfkitDoc, path, fontName){
	this.MAX_CHAR_TYPES = 92;

	this.pdfkitDoc = pdfkitDoc;
	this.path = path;
	this.pdfFonts = [];
	this.charCatalogue = [];
	this.name = fontName;

  Object.defineProperty(this, 'ascender', {
    get: function () {
      var font = this.getFont(0);
      return font.ascender;
    }
  });
  Object.defineProperty(this, 'decender', {
    get: function () {
      var font = this.getFont(0);
      return font.decender;
    }
  });

}
// private

FontWrapper.prototype.getFont = function(index){
	if(!this.pdfFonts[index]){

		var pseudoName = this.name + index;

		if(this.postscriptName){
			delete this.pdfkitDoc._fontFamilies[this.postscriptName];
		}

		this.pdfFonts[index] = this.pdfkitDoc.font(this.path, pseudoName)._font;
		if(!this.postscriptName){
			this.postscriptName = this.pdfFonts[index].name;
		}
	}

	return this.pdfFonts[index];
};

// public
FontWrapper.prototype.widthOfString = function(){
	var font = this.getFont(0);
	return font.widthOfString.apply(font, arguments);
};

FontWrapper.prototype.lineHeight = function(){
	var font = this.getFont(0);
	return font.lineHeight.apply(font, arguments);
};

FontWrapper.prototype.ref = function(){
	var font = this.getFont(0);
	return font.ref.apply(font, arguments);
};

var toCharCode = function(char){
  return char.charCodeAt(0);
};

FontWrapper.prototype.encode = function(text){
  var self = this;

  var charTypesInInline = text.split('').map(toCharCode).filter(function(elem,pos,arr) {
    return arr.indexOf(elem) == pos;
  });

	if (charTypesInInline.length > self.MAX_CHAR_TYPES) {
		throw new Error('Inline has more than '+ self.MAX_CHAR_TYPES + ': ' + text + ' different character types and therefore cannot be properly embedded into pdf.');
	}

  var characterFitInFontWithIndex = function (charCatalogue) {
    var list = charCatalogue.concat(charTypesInInline).filter(function(elem, pos,arr) {
      return arr.indexOf(elem) == pos;
    });
    return list.length <= self.MAX_CHAR_TYPES;
  };

  var index = _findIndex(self.charCatalogue, characterFitInFontWithIndex);

  if(index < 0){
    index = self.charCatalogue.length;
    self.charCatalogue[index] = [];
  }

	var font = self.getFont(index);
	font.use(text);

  _each(charTypesInInline, function(charCode){
    if(self.charCatalogue[index].indexOf(charCode) === -1){
      self.charCatalogue[index].push(charCode);
    }
  });

  var encodedText = _map(font.encode(text), function (char) {
    return char.charCodeAt(0).toString(16);
  }).join('');

  return {
    encodedText: encodedText,
    fontId: font.id
  };
};


module.exports = FontWrapper;
