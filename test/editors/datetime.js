;(function(Form, Editor) {

  QUnit.module('DateTime', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();
    },

    afterEach: function() {
      this.sinon.restore();
    }
  });

  var DateEditor = Form.editors.Date;

  QUnit.test('initialize() - default value - now (to the hour)', function(assert) {
    var editor = new Editor;

    var now = new Date,
        value = editor.value;

    assert.deepEqual(value.getFullYear(), now.getFullYear());
    assert.deepEqual(value.getMonth(), now.getMonth());
    assert.deepEqual(value.getDate(), now.getDate());
    assert.deepEqual(value.getHours(), now.getHours());
    assert.deepEqual(value.getMinutes(), now.getMinutes());
  });

  QUnit.test('initialize() - default options and schema', function(assert) {
    var editor = new Editor();

    var schema = editor.schema,
        options = editor.options;

    //Options should default to those stored on the static class
    assert.deepEqual(editor.options.DateEditor, Editor.DateEditor);

    //Schema options
    assert.deepEqual(schema.minsInterval, 15);
  });

  QUnit.test('initialize() - creates a Date instance', function(assert) {
    var spy = this.sinon.spy(Editor, 'DateEditor');

    var options = {},
        editor = new Editor(options);

    assert.ok(editor.dateEditor instanceof Editor.DateEditor, 'Created instance of date editor');
    assert.deepEqual(spy.lastCall.args[0], options);
  });

  QUnit.test('render() - calls setValue', function(assert) {
    var date = new Date,
        editor = new Editor({ value: date }),
        spy = this.sinon.spy(editor, 'setValue');

    editor.render();

    assert.ok(spy.calledWith(date), 'Called setValue');
  });

  QUnit.test('render() - creates hours and mins', function(assert) {
    var editor = new Editor().render();

    //Test DOM elements
    assert.deepEqual(editor.$hour.attr('data-type'), 'hour');
    assert.deepEqual(editor.$hour.find('option').length, 24);
    assert.deepEqual(editor.$hour.find('option:first').val(), '0');
    assert.deepEqual(editor.$hour.find('option:last').val(), '23');
    assert.deepEqual(editor.$hour.find('option:first').html(), '00');
    assert.deepEqual(editor.$hour.find('option:last').html(), '23');

    assert.deepEqual(editor.$min.attr('data-type'), 'min');
    assert.deepEqual(editor.$min.find('option').length, 4);
    assert.deepEqual(editor.$min.find('option:first').val(), '0');
    assert.deepEqual(editor.$min.find('option:last').val(), '45');
    assert.deepEqual(editor.$min.find('option:first').html(), '00');
    assert.deepEqual(editor.$min.find('option:last').html(), '45');
  });

  QUnit.test('render() - creates hours and mins - with custom minsInterval', function(assert) {
    var editor = new Editor({
        schema: { minsInterval: 1 }
    }).render();

    assert.deepEqual(editor.$min.attr('data-type'), 'min');
    assert.deepEqual(editor.$min.find('option').length, 60);
    assert.deepEqual(editor.$min.find('option:first').val(), '0');
    assert.deepEqual(editor.$min.find('option:last').val(), '59');
    assert.deepEqual(editor.$min.find('option:first').html(), '00');
    assert.deepEqual(editor.$min.find('option:last').html(), '59');
  });

  QUnit.test('getValue() - returns a Date', function(assert) {
    var date = new Date(2010, 5, 5, 14, 30),
        editor = new Editor({ value: date }).render();

    var value = editor.getValue();

    assert.deepEqual(value.constructor.name, 'Date');
    assert.deepEqual(value.getTime(), date.getTime());
  });

  QUnit.test('setValue()', function(assert) {
    var editor = new Editor().render();

    var spy = this.sinon.spy(editor.dateEditor, 'setValue');

    var date = new Date(2005, 1, 4, 19, 45);

    editor.setValue(date);

    //Should set value on date editor
    assert.deepEqual(spy.lastCall.args[0], date);

    assert.deepEqual(editor.getValue().getTime(), date.getTime());
  });

  QUnit.test('updates the hidden input when a value changes', function(assert) {
    var date = new Date();

    var editor = new Editor({
      value: date
    }).render();

    //Simulate changing the date manually
    editor.$hour.val(5).trigger('change');
    editor.$min.val(15).trigger('change');

    var hiddenVal = new Date(editor.$hidden.val());

    assert.deepEqual(editor.getValue().getTime(), hiddenVal.getTime());
    assert.deepEqual(hiddenVal.getHours(), 5);
    assert.deepEqual(hiddenVal.getMinutes(), 15);
  });

  QUnit.test('remove() - removes the date editor and self', function(assert) {
    this.sinon.spy(DateEditor.prototype, 'remove');
    this.sinon.spy(Form.editors.Base.prototype, 'remove');

    var editor = new Editor().render();

    editor.remove();

    assert.ok(DateEditor.prototype.remove.calledOnce);
    assert.ok(Form.editors.Base.prototype.remove.calledOnce);
  });

  QUnit.test('Uses Backbone.$ not global', function(assert) {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        value: new Date()
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    assert.ok(!exceptionCaught, ' using global \'$\' to render');
  });

  QUnit.module('DateTime events', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor().render();

      $('body').append(this.editor.el);
    },

    afterEach: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  QUnit.test("focus() - gives focus to editor and its first selectbox", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    assert.ok(editor.hasFocus);
    assert.ok(editor.$('select').first().is(':focus'));

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

  QUnit.test("blur() - removes focus from the editor and its focused selectbox", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    editor.blur();

    setTimeout(function() {
      assert.ok(!editor.hasFocus);
      assert.ok(!editor.$('input[type=selectbox]').first().is(':focus'));

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

  QUnit.test("'change' event - bubbles up from the selectbox", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$("select").first().val('31');
    editor.$("select").first().change();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });

  QUnit.test("'focus' event - bubbles up from selectbox when editor doesn't have focus", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("select").first().focus();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));

    editor.blur();

    setTimeout(function() {
      done();
    }, 0);
  });

  QUnit.test("'focus' event - doesn't bubble up from selectbox when editor already has focus", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("select").focus();

    assert.ok(!spy.called);

    editor.blur();

    setTimeout(function() {
      done();
    }, 0);
  });

  QUnit.test("'blur' event - bubbles up from selectbox when editor has focus and we're not focusing on another one of the editor's selectboxes", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("select").first().blur();

    setTimeout(function() {
      assert.ok(spy.called);
      assert.ok(spy.calledWith(editor));

      done();
    }, 0);
  });

  QUnit.test("'blur' event - doesn't bubble up from selectbox when editor has focus and we're focusing on another one of the editor's selectboxes", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("select:eq(0)").blur();
    editor.$("select:eq(1)").focus();

    setTimeout(function() {
      assert.ok(!spy.called);

      editor.blur();

      setTimeout(function() {
        done();
      }, 0);
    }, 0);
  });

  QUnit.test("'blur' event - doesn't bubble up from selectbox when editor doesn't have focus", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("select").blur();

    setTimeout(function() {
      assert.ok(!spy.called);

      done();
    }, 0);
  });

})(Backbone.Form, Backbone.Form.editors.DateTime);
