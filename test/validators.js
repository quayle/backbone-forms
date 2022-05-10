;(function(Form, Field, editors) {



;(function() {

  QUnit.module('general')

  QUnit.test('can change default error messages with mustache tags', function(assert) {
    var originalMessage = Form.validators.errMessages.email;

    Form.validators.errMessages.email = _.template('<%= value %> is an invalid email address. <%= customTag %>.', null, Form.templateSettings);

    var email = Form.validators.email({ customTag: 'Cool beans' })
    assert.equal(email('foo').message, 'foo is an invalid email address. Cool beans.')

    //Restore original message
    Form.validators.errMessages.email = originalMessage;
  })

})();


;(function() {

  QUnit.module('required')

  var required = Form.validators.required()

  QUnit.test('error if field is null or undefined or false', function(assert) {
    assert.ok(required(null))
    assert.ok(required())
    assert.ok(required(false))
  })

  QUnit.test('error if field is a string that contains only whitespace', function(assert) {
    assert.ok(required(" "))
    assert.ok(required("  "))
    assert.ok(required(" "))
    assert.ok(required("   "))
  })

  QUnit.test('error if field is empty string', function(assert) {
    assert.ok(required(''))
    assert.equal(required('test', undefined))
  })

  QUnit.test('ok if field is number 0', function(assert) {
    assert.equal(required(0), undefined)
  })

  QUnit.test('ok if field is boolean true', function(assert) {
    assert.equal(required(true), undefined)
  })

  QUnit.test('ok if field is string', function(assert) {
    assert.equal(required('test'), undefined)
    assert.equal(required(' test'), undefined)
    assert.equal(required('test '), undefined)
    assert.equal(required(' test '), undefined)
  })

  QUnit.test('required uses Backbone.$ not global #519', function(assert) {
    var old$ = window.$;

    window.$ = null;

    assert.ok(required("   "))

    window.$ = old$;
  })

})();


;(function() {

  QUnit.module('regexp')

  //Main
  var fn = Form.validators.regexp({
    regexp: /foo/
  });

  QUnit.test('passes empty values', function(assert) {
    assert.equal(fn(''), undefined)
    assert.equal(fn(null), undefined)
    assert.equal(fn(undefined), undefined)
  })

  QUnit.test('fails invalid strings', function(assert) {
    assert.equal(fn('gsurkbfsr').type, 'regexp')
    assert.equal(fn('guerbayf').message, 'Invalid')
  })

  QUnit.test('passes valid strings', function(assert) {
    assert.equal(fn('foo'), undefined)
    assert.equal(fn('_foo_'), undefined)
  })

  //regexp as string
  QUnit.test('fails string input', function(assert) {
    var fn = Form.validators.regexp({
      regexp : '^(foo|bar)$',
      flags : 'i'
    });

    assert.equal(fn(''), undefined)
    assert.equal(fn('food').type, 'regexp')
    assert.equal(fn('food').message, 'Invalid')
    assert.equal(fn('bars').type, 'regexp')
    assert.equal(fn('bars').message, 'Invalid')
  })

  QUnit.test('passes string input', function(assert) {
    var fn = Form.validators.regexp({
      regexp : '^(foo|bar)$',
      flags : 'i'
    });

    assert.equal(fn('foo'), undefined)
    assert.equal(fn('bar'), undefined)
  })


  //match option
  QUnit.test('passes valid strings with match=true', function(assert) {
    var fn = Form.validators.regexp({
      regexp: /foo/,
      match: true
    });

    assert.equal(fn('foo'), undefined)
  });

  QUnit.test('fails strings with match=true', function(assert) {
    var fn = Form.validators.regexp({
      regexp: /foo/,
      match: true
    });

    assert.equal(fn('bar').message, 'Invalid')
  });

  QUnit.test('passes valid strings with match=false', function(assert) {
    var fn = Form.validators.regexp({
      regexp: /foo/,
      match: false
    });

    assert.equal(fn('foo').message, 'Invalid');
  });

  QUnit.test('fails strings with match=false', function(assert) {
    var fn = Form.validators.regexp({
      regexp: /foo/,
      match: false
    });

    assert.equal(fn('bar'), undefined);
  });

})();


;(function() {
  QUnit.module('number')

  var fn = Form.validators.number()

  QUnit.test('passes empty values', function(assert) {
    assert.equal(fn(''), undefined)
    assert.equal(fn(null), undefined)
    assert.equal(fn(undefined), undefined)
  })

  QUnit.test('fails non-number values', function(assert) {
    assert.ok(fn('foo'))
    assert.ok(fn('123a'))
    assert.ok(fn('-.'))
    assert.ok(fn('5.'))
  })

  QUnit.test('accepts numbers', function(assert) {
    assert.equal(fn('123'), undefined)
    assert.equal(fn(456), undefined)
    assert.equal(fn(123.3), undefined)
    assert.equal(fn('123.5'), undefined)
    assert.equal(fn('-123.5'), undefined)
    assert.equal(fn(-123.5), undefined)
    assert.equal(fn('.5'), undefined)
    assert.equal(fn(0.5), undefined)
  })

})();


;(function() {
  QUnit.module('range')

  var fn = Form.validators.range()

  QUnit.test('passes empty values', function(assert) {
    assert.equal(fn(''), undefined)
    assert.equal(fn(null), undefined)
    assert.equal(fn(undefined), undefined)
  })

  QUnit.test('fails non-number values', function(assert) {
    assert.ok(fn('foo'))
    assert.ok(fn('123a'))
  })

  QUnit.test('accepts numbers in range', function(assert) {
    assert.equal(fn('12'), undefined)
    assert.equal(fn(45), undefined)
    assert.equal(fn(13.3), undefined)
    assert.equal(fn('23.5'), undefined)
  })

  QUnit.test('fails numbers out of range', function(assert) {
    assert.ok(fn('123'))
    assert.ok(fn(456))
    assert.ok(fn('-1'))
    assert.ok(fn(-2))
  })

})();


;(function() {
  QUnit.module('email')

  var fn = Form.validators.email()

  QUnit.test('passes empty values', function(assert) {
    assert.equal(fn(''), undefined)
    assert.equal(fn(null), undefined)
    assert.equal(fn(undefined), undefined)
  })

  QUnit.test('fails invalid emails', function(assert) {
    assert.ok(fn('invalid'))
    assert.ok(fn('email@example'))
    assert.ok(fn('foo@exa#mple.com'))
    assert.ok(fn(234))
    assert.ok(fn('#@%^%#$@#$@#.com'))
    assert.ok(fn('@domain.com'))
    assert.ok(fn('Joe Smith <email@domain.com>'))
    assert.ok(fn('email.domain.com'))
    assert.ok(fn('email@domain@domain.com'))
    assert.ok(fn('.email@domain.com'))
    assert.ok(fn('email.@domain.com'))
    assert.ok(fn('email..email@domain.com'))
    assert.ok(fn('あいうえお@domain.com'))
    assert.ok(fn('email@domain.com (Joe Smith)'))
    assert.ok(fn('email@-domain.com'))
    //ok(fn('email@domain.web')) //@todo: validate TLD
    //ok(fn('email@111.222.333.44444')) //@todo: check for valid IP
    assert.ok(fn('email@domain..com'))
  })

  QUnit.test('accepts valid emails', function(assert) {
    assert.equal(fn('foo/bar@example.com'), undefined)
    assert.equal(fn('foo?bar@example.com'), undefined)
    assert.equal(fn('test@example.com'), undefined)
    assert.equal(fn('john.smith@example.com'), undefined)
    assert.equal(fn('john.smith@example.co.uk'), undefined)
    assert.equal(fn('john-smith@example.com'), undefined)
    assert.equal(fn('john+smith@example.com'), undefined)
    assert.equal(fn('john\'s.email@example.com'), undefined)
    assert.equal(fn('email@123.123.123.123'), undefined)
    assert.equal(fn('1234567890@domain.com'), undefined)
    assert.equal(fn('email@domain-one.com'), undefined)
    assert.equal(fn('_______@domain.com'), undefined)
    assert.equal(fn('email@domain.name'), undefined)
  })

})();


;(function() {
  QUnit.module('url')

  var fn = Form.validators.url()

  QUnit.test('passes empty values', function(assert) {
    assert.equal(fn(''), undefined)
    assert.equal(fn(null), undefined)
    assert.equal(fn(undefined), undefined)
  })

  QUnit.test('fails invalid url', function(assert) {
    assert.ok(fn('invalid'))
    assert.ok(fn('.example.com'))
    assert.ok(fn('htp://example.com'))
    assert.ok(fn('http://example'))
    assert.ok(fn(234))
  })

  QUnit.test('accepts valid urls', function(assert) {
    assert.equal(fn('example.com'))
    assert.equal(fn('www.example.com'))
    assert.equal(fn('http://example.com'), undefined)
    assert.equal(fn('http://example.co.uk'), undefined)
    assert.equal(fn('http://www.example.com'), undefined)
    assert.equal(fn('http://www.example.com:8081'), undefined)
    assert.equal(fn('http://subdomain.domain.co.uk'), undefined)
    assert.equal(fn('http://example.com/path'), undefined)
    assert.equal(fn('http://www.example.com/path/1/2'), undefined)
    assert.equal(fn('http://www.example.com/path/1/2?q=str'), undefined)
  })

})();


;(function() {
  QUnit.module('match')

  var fn = Form.validators.match({
    field: 'confirm'
  });

  QUnit.test('passes empty values', function(assert) {
    assert.equal(fn(''), undefined)
    assert.equal(fn(null), undefined)
    assert.equal(fn(undefined), undefined)
  })

  QUnit.test('accepts when fields match', function(assert) {
    var attrs = {
      password: 'foo',
      confirm: 'foo'
    };

    assert.equal(fn('foo', attrs), undefined)
  })

  QUnit.test('fails when fields dont match', function(assert) {
    var attrs = {
      password: 'foo',
      confirm: 'bar'
    };

    var err = fn('foo', attrs)

    assert.equal(err.type, 'match')
    assert.equal(err.message, 'Must match field "confirm"')
  })
})();



})(Backbone.Form, Backbone.Form.Field, Backbone.Form.editors);
