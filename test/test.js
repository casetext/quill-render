var render = require('../index'),
	expect = require('chai').expect;

describe('quill-render', function() {

	it('renders inline format', function() {
		
		expect(
			render([
				{
					"insert": "Hi "
				},
				{
					"attributes": {
						"bold": true
					},
					"insert": "mom"
				}
			])
		)
		.to.equal('<p>Hi <b>mom</b></p>');

	});


	it('renders block format', function() {
		
		expect(
			render([
				{
					"insert": "LOOK AT THE KITTEN!"
				},
				{
					"attributes": {
						"image": "https://placekitten.com/g/200/300"
					},
					"insert": 1
				}
			])
		)
		.to.equal('<p>LOOK AT THE KITTEN!</p><p><img src="https://placekitten.com/g/200/300"></p><p></p>');

	});

	it('renders linifying format', function() {
		
		expect(
			render([
				{
					"insert": "Headline"
				},
				{
					"attributes": {
						"h1": true
					},
					"insert": "\n"
				}
			])
		)
		.to.equal('<h1>Headline</h1><p></p>');

	});

});