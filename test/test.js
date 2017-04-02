var render = require('../index'),
	expect = require('chai').expect;

describe('quill-render', function() {

	it('renders inline format', function() {

		expect(render([
			{
				"insert": "Hi "
			},
			{
				"attributes": {
					"bold": true
				},
				"insert": "mom"
			}
		]))
		.to.equal('<p>Hi <b>mom</b></p>');

	});


	it('renders block format', function() {

		expect(render([
			{
				"insert": "LOOK AT THE KITTEN!"
			},
			{
				"attributes": {
					"image": "https://placekitten.com/g/200/300"
				},
				"insert": 1
			}
		]))
		.to.equal('<p>LOOK AT THE KITTEN!</p><p><img src="https://placekitten.com/g/200/300"></p>');

	});

	it('renders linifying format', function() {

		expect(render([
			{
				"insert": "Headline"
			},
			{
				"attributes": {
					"h1": true
				},
				"insert": "\n"
			}
		]))
		.to.equal('<h1>Headline</h1>');

	});

	it('renders all heading levels', function() {
		var i,
			ops = [],
			expectedElements = [];

		// build ops to represent a line for each heading 1-6,
		// and build expected output
		for (i = 1; i <= 6; ++i) {
			var tagName = "h" + i,
				op = {
					"attributes": {},
					"insert": "\n"
				};
			op.attributes[tagName] = true;
			ops.push({
				"insert": "Heading"
			});
			ops.push(op);

			expectedElements.push("<" + tagName + ">Heading</" + tagName + ">");
		}

		expect(render(ops)).to.equal(expectedElements.join(""));
	});

	it('renders lists with inline formats correctly', function() {

		expect(render([
			{
				"attributes": {
					"italic": true
				},
				"insert": "Glenn v. Brumby"
			},
			{
				"insert": ", 663 F.3d 1312 (11th Cir. 2011)"
			},
			{
				"attributes": {
					"list": "ordered"
				},
				"insert": "\n"
			},
			{
				"attributes": {
					"italic": true
				},
				"insert": "Barnes v. City of Cincinnati"
			},
			{
				"insert": ", 401 F.3d 729 (6th Cir. 2005)"
			},
			{
				"attributes": {
					"list": "ordered"
				},
				"insert": "\n"
			}
		]))
		.to.equal('<ol><li><i>Glenn v. Brumby</i>, 663 F.3d 1312 (11th Cir. 2011)</li><li><i>Barnes v. City of Cincinnati</i>, 401 F.3d 729 (6th Cir. 2005)</li></ol>');
	});

	it('renders adjacent ordered and bullet lists correctly', function() {

		expect(render([
			{
				"insert": "bullet 1"
			},
			{
				"attributes": {
					"list": "bullet"
				},
				"insert": "\n"
			},
			{
				"insert": "bullet 2"
			},
			{
				"attributes": {
					"list": "bullet"
				},
				"insert": "\n"
			},
			{
				"insert": "item 1"
			},
			{
				"attributes": {
					"list": "ordered"
				},
				"insert": "\n"
			},
			{
				"insert": "item 2"
			},
			{
				"attributes": {
					"list": "ordered"
				},
				"insert": "\n"
			}
		]))
		.to.equal('<ul><li>bullet 1</li><li>bullet 2</li></ul><ol><li>item 1</li><li>item 2</li></ol>');

	});

	it('renders adjacent inline formats correctly', function() {
		expect(render([
			{
				"attributes" : {
					"italic" : true
				},
				"insert" : "Italics! "
			},
			{
				"attributes": {
					"italic": true,
					"link": "http://example.com"
				},
				"insert": "Italic link"
			},
			{
				"attributes": {
					"link": "http://example.com"
				},
				"insert": " regular link"
			}

		]))
		.to.equal('<p><i>Italics! <a href="http://example.com">Italic link</a></i><a href="http://example.com"> regular link</a></p>');
	});

	it('handles block inserts with inline styles', function() {
		expect(render([
		{
			"attributes": {
				"image": "https://placekitten.com/g/200/300",
				"link": "http://example.com"
			},
			"insert": 1
		}
		]))
		.to.equal('<p></p><p><a href="http://example.com"><img src="https://placekitten.com/g/200/300"></a></p>');
	});

	it('is XSS safe in regular text', function() {
		expect(render([
			{
				"insert": '<img src=x onerror="doBadThings()">'
			}
		]))
		.to.equal('<p>&lt;img src=x onerror=&quot;doBadThings()&quot;&gt;</p>');
	});

	it('is XSS safe in images', function() {
		expect(render([
			{
				"attributes": {
					"image": '"><img src=x onerror="doBadThings()">'
				},
				"insert": 1,
			}
		]))
		.to.equal('<p></p><p><img src="&quot;&gt;&lt;img src=x onerror=&quot;doBadThings()&quot;&gt;"></p>');
	});

	it('does not output an extra empty <p> tag at the end', function() {
		expect(render([
			{
				"insert": "text"
			}
		])).to.equal('<p>text</p>');

		expect(render([
			{
				"insert": "text\n"
			}
		])).to.equal('<p>text</p>');

		expect(render([
			{
				"insert": "text3"
			},
			{
				"attributes": {
					"list": "ordered"
				},
				"insert": "\n"
			},
			{
				"insert": "text4\n"
			}
		])).to.equal('<ol><li>text3</li></ol><p>text4</p>');
	});

	it('returns an extra empty <p> tag at the end if there is an extra newline', function() {
		expect(render([
			{
				"insert": "text2\n\n"
			}
		])).to.equal('<p>text2</p><p></p>');
	});
});
