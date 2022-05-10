;(function(Form, Editor) {

  QUnit.module('Checkbox', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();
    },

    afterEach: function() {
      this.sinon.restore();
    }
  });


  var Model = Backbone.Model.extend({
    schema: {
      enabled: { type: 'Checkbox' }
    }
  });



  QUnit.test('Default value', function(assert) {
    var editor = new Editor().render();

    assert.deepEqual(editor.getValue(), false);
  });

  QUnit.test('Custom value', function(assert) {
    var editor = new Editor({
      value: true
    }).render();

    assert.deepEqual(editor.getValue(), true);
  });

  QUnit.test('Value from model', function(assert) {
    var editor = new Editor({
      model: new Model({ enabled: true }),
      key: 'enabled'
    }).render();

    assert.deepEqual(editor.getValue(), true);
  });

  QUnit.test('Correct type', function(assert) {
    var editor = new Editor().render();

    assert.deepEqual($(editor.el).get(0).tagName, 'INPUT');
    assert.deepEqual($(editor.el).attr('type'), 'checkbox');
  });

  QUnit.test("getValue() - returns boolean", function(assert) {
    var editor1 = new Editor({
      value: true
    }).render();

    var editor2 = new Editor({
      value: false
    }).render();

    assert.deepEqual(editor1.getValue(), true);
    assert.deepEqual(editor2.getValue(), false);
  });

  QUnit.test("setValue() - updates the input value", function(assert) {
    var editor = new Editor({
      model: new Model,
      key: 'enabled'
    }).render();

    editor.setValue(true);

    assert.deepEqual(editor.getValue(), true);
    assert.deepEqual($(editor.el).prop('checked'), true);

    editor.setValue(false);

    assert.deepEqual(editor.getValue(), false);
    assert.deepEqual($(editor.el).prop('checked'), false);
  });

  QUnit.test("setValue() - updates the model value", function(assert) {
    var editor = new Editor({
      model: new Model,
      key: 'enabled'
    }).render();

    editor.setValue(true);
    editor.render();
    assert.deepEqual(editor.getValue(), true);
    assert.deepEqual($(editor.el).prop('checked'), true);

    editor.setValue(false);

    assert.deepEqual(editor.getValue(), false);
    assert.deepEqual($(editor.el).prop('checked'), false);
  });

  QUnit.test('Uses Backbone.$ not global', function(assert) {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        value: true
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    assert.ok(!exceptionCaught, ' using global \'$\' to render');
  });

  QUnit.module('Checkbox events', {
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

  QUnit.test("focus() - gives focus to editor and its checkbox", function(assert) {
    var editor = this.editor;

    editor.focus();

    assert.ok(editor.hasFocus);
    assert.ok(editor.$el.is(':focus'));
  });

  QUnit.test("focus() - triggers the 'focus' event", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });

  QUnit.test("blur() - removes focus from the editor and its checkbox", function(assert) {
    var editor = this.editor;

    editor.focus();

    editor.blur();

    assert.ok(!editor.hasFocus);
    assert.ok(!editor.$el.is(':focus'));
  });

  QUnit.test("blur() - triggers the 'blur' event", function(assert) {
    var editor = this.editor;

    editor.focus()

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.blur();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });

  QUnit.test("'change' event - is triggered when the checkbox is clicked", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$el.click();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
  });

  QUnit.test("'focus' event - bubbles up from the checkbox", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$el.focus();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
  });

  QUnit.test("'blur' event - bubbles up from the checkbox", function(assert) {
    var editor = this.editor;

    editor.$el.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$el.blur();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
  });

})(Backbone.Form, Backbone.Form.editors.Checkbox);
