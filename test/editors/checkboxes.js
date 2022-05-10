;(function(Form, Editor) {

  QUnit.module('Checkboxes', {
    beforeEach: function() {
        this.sinon = sinon.sandbox.create();
    },

    afterEach: function() {
        this.sinon.restore();
    }
  });


  var schema = {
    options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam', 'Doctor Krieger']
  };



  QUnit.test('Options as array of objects', function(assert) {
    var editor = new Editor({
      schema: {
        options: [
          {
            val: 0,
            label: "Option 1"
          },
          {
            val: 1,
            label: "Option 2"
          },
          {
            val: 2,
            label: "Option 3"
          }
        ]
      }
    }).render();

    var checkboxes = editor.$el.find("input[type=checkbox]");
    var labels = editor.$el.find("label");

    assert.equal(checkboxes.length, 3);
    assert.equal(checkboxes.length, labels.length);

    assert.equal(labels.first().html(), "Option 1");
    assert.equal(labels.last().html(), "Option 3");

    assert.equal(checkboxes.first().val(), "0");
    assert.equal(checkboxes.last().val(), "2");
  });


  QUnit.test('Options as array of group objects', function(assert) {
    var editor = new Editor({
      schema: {
        options: [
          {
            group: 'North America', options: [
              { val: 'ca', label: 'Canada' },
              { val: 'us', label: 'United States' }
            ],
          },
          {
            group: 'Europe', options: [
              { val: 'es', label: 'Spain' },
              { val: 'fr', label: 'France' },
              { val: 'uk', label: 'United Kingdom' }
            ]
          }
        ]
      }
    }).render();

    var checkboxes = editor.$el.find("input[type=checkbox]");
    var labels = editor.$el.find("label");
		var fieldset = editor.$el.find("fieldset");
    var uniqueLabels = [];
    assert.equal(checkboxes.length, 5);
    assert.equal(checkboxes.length, labels.length);
    assert.equal(fieldset.length, 2);
    labels.each(function(){
      if(uniqueLabels.indexOf($(this).attr('for')) == -1 )
        uniqueLabels.push($(this).attr('for'));
    });
    assert.equal(checkboxes.length, uniqueLabels.length);

  });

  QUnit.test('Default value', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();

    var value = editor.getValue();
    assert.equal(_.isEqual(value, []), true);
  });

  QUnit.test('Custom value', function(assert) {
    var editor = new Editor({
      value: ['Cyril'],
      schema: schema
    }).render();

    var value = editor.getValue();
    var expected = ['Cyril'];
    assert.equal(_.isEqual(expected, value), true);
  });

  QUnit.test('Throws errors if no options', function (assert) {
      assert.throws(function () {
          var editor = new Editor({schema: {}});
      }, /Missing required/, 'ERROR: Accepted a new Checkboxes editor with no options.');
  });

  // Value from model doesn't work here as the value must be an array.

  QUnit.test('Correct type', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();
    assert.equal($(editor.el).get(0).tagName, 'UL');
    assert.notEqual($(editor.el).find('input[type=checkbox]').length, 0);
  });

  QUnit.test('Uses Backbone.$ not global', function(assert) {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        schema: schema
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    assert.ok(!exceptionCaught, ' using global \'$\' to render');
  });

  QUnit.test('setting value with one item', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();

    editor.setValue(['Lana']);

    assert.deepEqual(editor.getValue(), ['Lana']);
    assert.equal($(editor.el).find('input[type=checkbox]:checked').length, 1);
  });

  QUnit.test('setting model value with one item', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();

    editor.setValue(['Lana']);
    editor.render();
    assert.deepEqual(editor.getValue(), ['Lana']);
    assert.equal($(editor.el).find('input[type=checkbox]:checked').length, 1);
  });

  QUnit.test('setting value with multiple items, including a value with a space', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();

    editor.setValue(['Lana', 'Doctor Krieger']);

    assert.deepEqual(editor.getValue(), ['Lana', 'Doctor Krieger']);
    assert.equal($(editor.el).find('input[type=checkbox]:checked').length, 2);
  });



  QUnit.module('Checkboxes events', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor({
        schema: schema
      }).render();

      $('body').append(this.editor.el);
    },

    afterEach: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  QUnit.test("focus() - gives focus to editor and its first checkbox", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    assert.ok(editor.hasFocus);
    assert.ok(editor.$('input[type=checkbox]').first().is(':focus'));

    editor.blur();

    setTimeout(function() {
      done();
    }, 0);
  });

  QUnit.test("focus() - triggers the 'focus' event", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    setTimeout(function() {
      assert.ok(spy.called);
      assert.ok(spy.calledWith(editor));

      editor.blur();

      setTimeout(function() {
        done();
      }, 0);
    }, 0);
  });

  QUnit.test("blur() - removes focus from the editor and its focused checkbox", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    editor.blur();

    setTimeout(function() {
      assert.ok(!editor.hasFocus);
      assert.ok(!editor.$('input[type=checkbox]').first().is(':focus'));

      done();
    }, 0);
  });

  QUnit.test("blur() - triggers the 'blur' event", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.blur();

    setTimeout(function() {
      assert.ok(spy.called);
      assert.ok(spy.calledWith(editor));

      done();
    }, 0);
  });

  QUnit.test("'change' event - is triggered when a checkbox is clicked", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$("input[type=checkbox]").first().click();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));

    editor.$("input[type=checkbox]").val([null]);
  });

  QUnit.test("'focus' event - bubbles up from checkbox when editor doesn't have focus", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("input[type=checkbox]").first().focus();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));

    editor.blur();

    setTimeout(function() {
      done();
    }, 0);
  });

  QUnit.test("'focus' event - doesn't bubble up from checkbox when editor already has focus", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("input[type=checkbox]").focus();

    assert.ok(!spy.called);

    editor.blur();

    setTimeout(function() {
      done();
    }, 0);
  });

  QUnit.test("'blur' event - bubbles up from checkbox when editor has focus and we're not focusing on another one of the editor's checkboxes", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=checkbox]").first().blur();

    setTimeout(function() {
      assert.ok(spy.called);
      assert.ok(spy.calledWith(editor));

      done();
    }, 0);
  });

  QUnit.test("'blur' event - doesn't bubble up from checkbox when editor has focus and we're focusing on another one of the editor's checkboxes", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=checkbox]:eq(0)").blur();
    editor.$("input[type=checkbox]:eq(1)").focus();

    setTimeout(function() {
      assert.ok(!spy.called);

      editor.blur();

      setTimeout(function() {
        done();
      }, 0);
    }, 0);
  });

  QUnit.test("'blur' event - doesn't bubble up from checkbox when editor doesn't have focus", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=checkbox]").blur();

    setTimeout(function() {
      assert.ok(!spy.called);

      done();
    }, 0);
  });

  QUnit.module('Checkboxes Text Escaping', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();

      this.options = [
        {
          val: '"/><script>throw("XSS Success");</script>',
          label: '"/><script>throw("XSS Success");</script>'
        },
        {
          val: '\"?\'\/><script>throw("XSS Success");</script>',
          label: '\"?\'\/><script>throw("XSS Success");</script>',
        },
        {
          val: '><b>HTML</b><',
          label: '><div class=>HTML</b><',
        }
      ];

      this.editor = new Editor({
        schema: {
          options: this.options
        }
      }).render();

      $('body').append(this.editor.el);
    },

    afterEach: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  QUnit.test('options content gets properly escaped', function(assert) {

    var editor = this.editor;
    var options = this.options;

    assert.deepEqual(editor.schema.options, this.options );

    assert.deepEqual(editor.$('script').length, 0);
    assert.deepEqual(editor.$('b').length, 0);

    var inputs = editor.$('input');

    editor.$('label').each(function(index) {
        assert.deepEqual(editor.$(inputs[index]).val(), options[index].val );

        assert.deepEqual(editor.$(this).text(),  options[index].label );
        assert.notDeepEqual(editor.$(this).html(), options[index].label );
        assert.notEqual(editor.$(this).html().indexOf('&lt;'), -1);
    });

    assert.deepEqual(this.editor.schema.options, this.options);
  });

  QUnit.test('options object content gets properly escaped', function(assert) {

      var options = {
        key1: '><b>HTML</b><',
        key2: '><div class=>HTML</b><'
      };

      var editor = new Editor({
        schema: {
          options: options
        }
      }).render();

    var optionKeys = _.keys(options);
    var inputs = editor.$('input');

    assert.deepEqual(editor.schema.options, options );

    assert.deepEqual(editor.$('b').length, 0);

    editor.$('label').each(function(index) {
        var option = options[optionKeys[index]];

        assert.deepEqual(editor.$(inputs[index]).val(), optionKeys[index]);
        assert.deepEqual(editor.$(this).text(),  option);
        assert.notDeepEqual(editor.$(this).html(), option);
        assert.notEqual(editor.$(this).html().indexOf('&lt;'), -1);
    });
  });

  QUnit.test('options labels can be labelHTML, which will not be escaped', function(assert) {

      var options = [
        {
          val: '><b>HTML</b><',
          labelHTML: '><div class=>HTML</b><',
          label: 'will be ignored'
        }
      ];

      var editor = new Editor({
        schema: {
          options: options
        }
      }).render();

    assert.deepEqual(editor.schema.options, options );

    assert.deepEqual(editor.$('input').val(), options[0].val );

    //Note that in these 2 results, the labelHTML has
    //been transformed because the HTML was invalid
    assert.deepEqual(editor.$('label').first().text().trim(), '>HTML<' );
    assert.deepEqual(editor.$('label').first().html(), '&gt;<div class=\"\">HTML&lt;</div>' );

  });

  QUnit.test('option groups content gets properly escaped', function(assert) {
    var options = [{
      group: '"/><script>throw("XSS Success");</script>',
      options: [
        {
          val: '"/><script>throw("XSS Success");</script>',
          label: '"/><script>throw("XSS Success");</script>'
        },
        {
          val: '\"?\'\/><script>throw("XSS Success");</script>',
          label: '\"?\'\/><script>throw("XSS Success");</script>',
        },
        {
          val: '><b>HTML</b><',
          label: '><div class=>HTML</b><',
        }
      ]
    }];
    var editor = new Editor({
      schema: {
        options: options
      }
    }).render();

    assert.deepEqual(editor.schema.options, options );

    assert.deepEqual(editor.$('script').length, 0);
    assert.deepEqual(editor.$('b').length, 0);

    var inputs = editor.$('input');

    editor.$('label').each(function(index) {
        assert.deepEqual(editor.$(inputs[index]).val(), options[0].options[index].val );

        assert.deepEqual(editor.$(this).text(),  options[0].options[index].label );
        assert.notDeepEqual(editor.$(this).html(), options[0].options[index].label );
        assert.notEqual(editor.$(this).html().indexOf('&lt;'), -1);
    });
  });

})(Backbone.Form, Backbone.Form.editors.Checkboxes);
