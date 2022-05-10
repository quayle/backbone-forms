;(function(Form, Editor) {

  QUnit.module('Object', {
    beforeEach: function() {
        this.sinon = sinon.sandbox.create();
    },

    afterEach: function() {
        this.sinon.restore();
    }
  });


  var schema = {
    subSchema: {
      id: { type: 'Number' },
      name: { }
    }
  };



  QUnit.test('Default value', function(assert) {
    var editor = new Editor({
      form: new Form(),
      schema: schema
    }).render();

    assert.deepEqual(editor.getValue(), { id: 0, name: '' });
  });

  QUnit.test('Custom value', function(assert) {
    var editor = new Editor({
      form: new Form(),
      schema: schema,
      value: {
        id: 42,
        name: "Krieger"
      }
    }).render();

    assert.deepEqual(editor.getValue(), { id: 42, name: "Krieger" });
  });

  QUnit.test('Value from model', function(assert) {
    var agency = new Backbone.Model({
      spy: {
        id: 28,
        name: 'Pam'
      }
    });

    var editor = new Editor({
      form: new Form(),
      schema: schema,
      model: agency,
      key: 'spy'
    }).render();

    assert.deepEqual(editor.getValue(), { id: 28, name: 'Pam' });
  });

  QUnit.test.todo("idPrefix is added to child form elements", function(assert) {
    assert.ok(1);
  });

  QUnit.test.todo("remove() - Removes embedded form", function(assert) {
    assert.ok(1);
  });

  QUnit.test.todo('uses the nestededitor template, unless overridden in editor schema', function(assert) {
    assert.ok(1);
  });

  QUnit.test("setValue() - updates the input value", function(assert) {
    var editor = new Editor({
      form: new Form(),
      schema: schema,
      value: {
        id: 42,
        name: "Krieger"
      }
    }).render();

    var newValue = {
      id: 89,
      name: "Sterling"
    };

    editor.setValue(newValue);

    assert.deepEqual(editor.getValue(), newValue);
  });

  QUnit.test('validate() - returns validation errors', function(assert) {
    var schema = {
      validators: [function a(a,b) { return {modelCheck:true}}]
    };
    schema.subSchema = {
      id:     { validators: ['required'] },
      name:   {},
      email:  { validators: ['email'] }
    }

    var editor = new Editor({
      form: new Form(),
      schema: schema,
      value: {
        id: null,
        email: 'invalid'
      }
    }).render();

    var errs = editor.validate();

    assert.equal(errs.id.type, 'required');
    assert.equal(errs.email.type, 'email');
    assert.equal(errs.modelCheck, true);
  });

  QUnit.test('Uses Backbone.$ not global', function(assert) {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        form: new Form(),
        schema: schema
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    assert.ok(!exceptionCaught, ' using global \'$\' to render');
  });

  QUnit.module('Object events', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor({
        form: new Form(),
        schema: schema
      }).render();

      $('body').append(this.editor.el);
    },

    afterEach: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  QUnit.test("focus() - gives focus to editor and its form", function(assert) {
    var editor = this.editor;

    editor.focus();

    assert.ok(editor.hasFocus);
    assert.ok(editor.nestedForm.hasFocus);
  });

  QUnit.test("focus() - triggers the 'focus' event", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });

  QUnit.test("blur() - removes focus from the editor and its form", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    editor.blur();

    setTimeout(function() {
      assert.ok(!editor.hasFocus);
      assert.ok(!editor.nestedForm.hasFocus);

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

      done()
    }, 0);
  });

  QUnit.test("'change' event - bubbles up from the form", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.nestedForm.trigger('change', editor.nestedForm);

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });

  QUnit.test("'focus' event - bubbles up from the form when editor doesn't have focus", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.nestedForm.focus();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });

  QUnit.test("'focus' event - doesn't bubble up from the editor when editor already has focus", function(assert) {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.nestedForm.focus();

    assert.ok(!spy.called);
  });

  QUnit.test("'blur' event - bubbles up from the form when editor has focus", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.nestedForm.blur();

    setTimeout(function() {
      assert.ok(spy.called);
      assert.ok(spy.calledWith(editor));

      done();
    }, 0);
  });

  QUnit.test("'blur' event - doesn't bubble up from the form when editor doesn't have focus", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.nestedForm.blur();

    setTimeout(function() {
      assert.ok(!spy.called);

      done();
    }, 0);
  });

  QUnit.test("Events bubbling up from the form", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('whatever', spy);

    editor.nestedForm.trigger('whatever', editor.nestedForm);

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });

})(Backbone.Form, Backbone.Form.editors.Object);
