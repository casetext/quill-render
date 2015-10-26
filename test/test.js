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
		.to.equal('<p>LOOK AT THE KITTEN!</p><p><img src="https://placekitten.com/g/200/300"></p><p></p>');

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
		.to.equal('<h1>Headline</h1><p></p>');

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
					"list": true
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
					"list": true
				},
				"insert": "\n"
			}
		]))
		.to.equal('<ol><li><i>Glenn v. Brumby</i>, 663 F.3d 1312 (11th Cir. 2011)</li><li><i>Barnes v. City of Cincinnati</i>, 401 F.3d 729 (6th Cir. 2005)</li></ol><p></p>');

	});


	it('renders adjacent lists correctly', function() {

		expect(render([
			{
				"insert": "Item 1"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": true
				}
			},
			{
				"insert": "Item 2"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": true
				}
			},
			{
				"insert": "Item 3"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": true
				}
			},
			{
				"insert": "Intervening paragraph\nItem 4"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": true
				}
			},
			{
				"insert": "Item 5"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": true
				}
			},
			{
				"insert": "Item 6"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": true
				}
			}
		]))
		.to.equal('<ol><li>Item 1</li><li>Item 2</li><li>Item 3</li></ol><p>Intervening paragraph</p><ol><li>Item 4</li><li>Item 5</li><li>Item 6</li></ol><p></p>');

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
		.to.equal('<p></p><p><a href="http://example.com"><img src="https://placekitten.com/g/200/300"></a></p><p></p>');
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
		.to.equal('<p></p><p><img src="&quot;&gt;&lt;img src=x onerror=&quot;doBadThings()&quot;&gt;"></p><p></p>');
	});
});
