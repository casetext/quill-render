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

  it('renders lists correctly', function() {

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

});
