quill-render
============

[![Build Status](https://travis-ci.org/casetext/quill-render.svg)](https://travis-ci.org/casetext/quill-render)

Renders a sequence of [quill](http://quilljs.com/) insert-only deltas (operational transforms) into HTML with no browser dependencies.

This is accomplished by using [cheerio](https://github.com/cheeriojs/cheerio) to build a DOM from the delta sequence.

One way to get a document's insert-only deltas is by calling [`Quill#getContents()`](http://quilljs.com/docs/api/#quillprototypegetcontents) in the browser.

Example
-------

    var render = require('quill-render');
    render([
        {
            "attributes": {
                "bold": true
            },
            "insert": "Hi mom"
        }
    ]);
    // => '<b>Hi mom</b>'

If you want the cheerio object instead of the HTML, use `render.asDOM()`.

    var $ = render.asDOM([...]);
    // ... DOM surgery ...

Extending
---------

quill-render exposes the functions it uses to produce markup so that you can tweak it to fit your needs.  You can change the behavior of the builtin formats or create your own.

Each function is passed `$` (the root cheerio object) and the value of the format.

For inline styles, return a new element.  The contents of the insert will be appended as children of the element.

    render.format.inline.bold = function($/*, formatValue */) {
        return $('<b>').addClass('super-important');
    };
    // above example would now return '<b class="super-important">Hi mom</b>'

For 'block' styles (those deltas where `insert === 1` -- ie images), `this` will be the block container (a `<p>`).  Append elements to it.

    render.format.block.image = function($, src) {
        var img = $('<img>');
        img.attr('src', src);
        this.append(img);
    };

For line styles (those deltas where `insert == '\n'` and the format is meant to apply to the entire line), `this` will be the line's container (a `p`.)

    render.format.lineify.h1 = function(/* $, formatValue */) {
        this[0].name = 'h1'; // change the line container tag to a h1
    };

You can also specify a grouping tag.  When multiple lines with the same format appear is sequence, the entire group is wrapped in the group element.  (ie lists)

    render.format.lineify.bullet = {
        group: function($) {
            return $('<ul>'); // return the element that will be the parent of all group members
        },
        line: function() {
            this[0].name = 'li'; // make each group member a li
        }
    };

