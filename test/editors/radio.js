;(function(Form, Editor) {

  QUnit.module('Radio', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();
    },

    afterEach: function() {
      this.sinon.restore();
    }
  });

  var same = deepEqual;

  var schema = {
    options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
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

    var radios = editor.$el.find("input[type=radio]");
    var labels = editor.$el.find("label");

    assert.equal(radios.length, 3);
    assert.equal(radios.length, labels.length);

    assert.equal(labels.first().html(), "Option 1");
    assert.equal(labels.last().html(), "Option 3");

    assert.equal(radios.first().val(), "0");
    assert.equal(radios.last().val(), "2");
  });

  QUnit.test('Default value', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();

    assert.equal(editor.getValue(), undefined);
  });

  QUnit.test('Custom value', function(assert) {
    var editor = new Editor({
      value: 'Cyril',
      schema: schema
    }).render();

    assert.equal(editor.getValue(), 'Cyril');
  });

  QUnit.test('Throws errors if no options', function () {
    throws(function () {
      var editor = new Editor({schema: {}});
    }, /Missing required/, 'ERROR: Accepted a new Radio editor with no options.');
  });

  QUnit.test('Value from model', function(assert) {
    var editor = new Editor({
      model: new Backbone.Model({ name: 'Lana' }),
      key: 'name',
      schema: schema
    }).render();
    assert.equal(editor.getValue(), 'Lana');
  });

  QUnit.test('Correct type', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();
    assert.equal($(editor.el).get(0).tagName, 'UL');
    notEqual($(editor.el).find('input[type=radio]').length, 0);
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

  QUnit.module('#getTemplate()');

  QUnit.test('returns schema template first', function(assert) {
    var template = _.template('<div>');

    var editor = new Editor({
      schema: { template: template, options: [] }
    });

    assert.equal(editor.getTemplate(), template);
  });

  QUnit.test('then constructor template', function(assert) {
    var editor = new Editor({
      schema: { options: [] }
    });

    assert.equal(editor.getTemplate(), Editor.template);
  });



  QUnit.module('Radio events', {
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

  QUnit.test("focus() - gives focus to editor and its first radiobutton when no radiobutton is checked", function() {
    var editor = this.editor;

    editor.focus();

    assert.ok(editor.hasFocus);
    assert.ok(editor.$('input[type=radio]').first().is(':focus'));

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  QUnit.test("focus() - gives focus to editor and its checked radiobutton when a radiobutton is checked", function() {
    var editor = this.editor;

    editor.$('input[type=radio]').val([editor.$('input[type=radio]').eq(1).val()]);

    editor.focus();

    assert.ok(editor.hasFocus);
    assert.ok(editor.$('input[type=radio]').eq(1).is(':focus'));

    editor.$('input[type=radio]').val([null]);

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  QUnit.test("focus() - triggers the 'focus' event", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    stop();
    setTimeout(function() {
      assert.ok(spy.called);
      assert.ok(spy.calledWith(editor));

      editor.blur();

      setTimeout(function() {
        start();
      }, 0);
    }, 0);
  });

  QUnit.test("blur() - removes focus from the editor and its focused radiobutton", function() {
    var editor = this.editor;

    editor.focus();

    editor.blur();

    stop();
    setTimeout(function() {
      assert.ok(!editor.hasFocus);
      assert.ok(!editor.$('input[type=radio]').first().is(':focus'));

      start();
    }, 0);
  });

  QUnit.test("blur() - triggers the 'blur' event", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.blur();

    stop();
    setTimeout(function() {
      assert.ok(spy.called);
      assert.ok(spy.calledWith(editor));

      start();
    }, 0);
  });

  QUnit.test("'change' event - is triggered when a non-checked radiobutton is clicked", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$("input[type=radio]:not(:checked)").first().click();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));

    editor.$("input[type=radio]").val([null]);
  });

  QUnit.test("'focus' event - bubbles up from radiobutton when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("input[type=radio]").first().focus();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  QUnit.test("'focus' event - doesn't bubble up from radiobutton when editor already has focus", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("input[type=radio]").focus();

    assert.ok(!spy.called);

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  QUnit.test("'blur' event - bubbles up from radiobutton when editor has focus and we're not focusing on another one of the editor's radiobuttons", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=radio]").first().blur();

    stop();
    setTimeout(function() {
        assert.ok(spy.called);
        assert.ok(spy.calledWith(editor));

        start();
    }, 0);
  });

  QUnit.test("'blur' event - doesn't bubble up from radiobutton when editor has focus and we're focusing on another one of the editor's radiobuttons", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=radio]:eq(0)").blur();
    editor.$("input[type=radio]:eq(1)").focus();

    stop();
    setTimeout(function() {
      assert.ok(!spy.called);

      editor.blur();

      setTimeout(function() {
        start();
      }, 0);
    }, 0);
  });

  QUnit.test("'blur' event - doesn't bubble up from radiobutton when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=radio]").blur();

    stop();
    setTimeout(function() {
      assert.ok(!spy.called);

      start();
    }, 0);
  });



  QUnit.module('Radio Text Escaping', {
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

  QUnit.test('options array content gets properly escaped', function(assert) {

    var editor = this.editor;
    var options = this.options;

    same( editor.schema.options, this.options );

    same( editor.$('script').length, 0);
    same( editor.$('b').length, 0);

    var inputs = editor.$('input');

    editor.$('label').each(function(index) {
        same( editor.$(inputs[index]).val(), options[index].val );

        same( editor.$(this).text(),  options[index].label );
        notDeepEqual( editor.$(this).html(), options[index].label );
        notEqual( editor.$(this).html().indexOf('&lt;'), -1);
    });
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

    same( editor.schema.options, options );

    same( editor.$('b').length, 0);


    editor.$('label').each(function(index) {
        var option = options[optionKeys[index]];

        same( editor.$(inputs[index]).val(), optionKeys[index] );
        same( editor.$(this).text(),  option );
        notDeepEqual( editor.$(this).html(), option );
        notEqual( editor.$(this).html().indexOf('&lt;'), -1);
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

    same( editor.schema.options, options );

    same( editor.$('input').val(), options[0].val );

    //Note that in these 2 results, the labelHTML has
    //been transformed because the HTML was invalid
    same( editor.$('label').first().text().trim(), '>HTML<' );
    same( editor.$('label').first().html(), '&gt;<div class=\"\">HTML&lt;      </div>' );

  });

})(Backbone.Form, Backbone.Form.editors.Radio);
