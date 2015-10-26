var cheerio = require('cheerio'),
	escapeHtml = require('escape-html');


exports = module.exports = function(ops) {
	return convert(ops).html();
};

exports.asDOM = convert;

var format = exports.format = {

	block: {
		image: function($, src) {
			var img = $('<img>');
			img.attr('src', src);
			this.append(img);
		}
	},

	inline: {
		italic: function($) {
			return $('<i>');
		},
		bold: function($) {
			return $('<b>');
		},
		link: function($, href) {
			return $('<a>').attr('href', href);
		}
	},

	lineify: {
		h1: function() {
			this[0].name = 'h1';
		},
		h2: function() {
			this[0].name = 'h2';
		},
		h3: function() {
			this[0].name = 'h3';
		},
		bullet: {
			group: function($) {
				return $('<ul>');
			},
			line: function() {
				this[0].name = 'li';
			}
		},
		list: {
			group: function($) {
				return $('<ol>');
			},
			line: function() {
				this[0].name = 'li';
			}
		}
	}

};

function convert(ops) {
	var $ = cheerio.load(''), group, line, el, activeInline, beginningOfLine;

	function newLine() {
		el = line = $('<p>');
		$.root().append(line);
		activeInline = {};
	}
	newLine();

	for (var i = 0; i < ops.length; i++) {
		var op = ops[i];
		if (op.insert === 1) {
			for (var k in op.attributes) {
				if (format.block[k]) {
					newLine();
					applyStyles(op.attributes);
					format.block[k].call(el, $, op.attributes[k]);
					newLine();
				}
			}
		} else {
			var lines = escapeHtml(op.insert).split('\n');

			if (isLinifyable(op.attributes)) {
				// Some line-level styling (ie headings) is applied by inserting a \n
				// with the style; the style applies back to the previous \n.
				// There *should* only be one style in an insert operation.

				for (var j = 1; j < lines.length; j++) {
					for (var k in op.attributes) {
						if (format.lineify[k]) {

							var fn = format.lineify[k];
							if (typeof fn == 'object') {
								if (group && group.type != k) {
									group = null;
								}
								if (!group && fn.group) {
									group = {
										el: fn.group($),
										type: k,
										distance: 0
									};
									$.root().append(group.el);
								}

								if (group) {
									group.el.append(line);
									group.distance = 0;
								}
								fn = fn.line;
							}

							fn.call(line, $, op.attributes[k]);
							newLine();
							break;
						}
					}
				}
				beginningOfLine = true;

			} else {
				for (var j = 0; j < lines.length; j++) {
					if ((j > 0 || beginningOfLine) && group && ++group.distance >= 2) {
						group = null;
					}
					applyStyles(op.attributes, ops[i+1] && ops[i+1].attributes);
					el.append(lines[j]);
					if (j < lines.length-1) {
						newLine();
					}
				}
				beginningOfLine = false;

			}
		}
	}

	return $;

	function applyStyles(attrs, next) {

		var first = [], then = [];
		attrs = attrs || {};

		var tag = el, seen = {};
		while (tag[0]._format) {
			seen[tag[0]._format] = true;
			if (!attrs[tag[0]._format]) {
				for (var k in seen) {
					delete activeInline[k];
				}
				el = tag.parent();
			}

			tag = tag.parent();
		}

		for (var k in attrs) {
			if (format.inline[k]) {

				if (activeInline[k]) {
					if (activeInline[k] != attrs[k]) {
						// ie when two links abut

					} else {
						continue; // do nothing -- we should already be inside this style's tag
					}
				}
				
				if (next && attrs[k] == next[k]) {
					first.push(k); // if the next operation has the same style, this should be the outermost tag
				} else {
					then.push(k);
				}
				activeInline[k] = attrs[k];
			
			}
		}

		first.forEach(apply);
		then.forEach(apply);

		function apply(fmt) {
			var newEl = format.inline[fmt].call(null, $, attrs[fmt]);
			newEl[0]._format = fmt;
			el.append(newEl);
			el = newEl;
		}


	}
}

function isLinifyable(attrs) {
	for (var k in attrs) {
		if (format.lineify[k]) {
			return true;
		}
	}
	return false;
}




