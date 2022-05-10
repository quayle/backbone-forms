;(function(Form, Editor) {

  QUnit.module('Number');


  QUnit.test('Default value', function(assert) {
    var editor = new Editor().render();

    assert.deepEqual(editor.getValue(), 0);
  });

  QUnit.test('Null value', function(assert) {
    var editor = new Editor().render();
    editor.setValue(null);

    assert.deepEqual(editor.getValue(), null);
  });

  QUnit.test('Custom value', function(assert) {
    var editor = new Editor({
      value: 100
    }).render();

    assert.deepEqual(editor.getValue(), 100);
  });

  QUnit.test('Value from model', function(assert) {
    var editor = new Editor({
      model: new Backbone.Model({ title: 99 }),
      key: 'title'
    }).render();

    assert.deepEqual(editor.getValue(), 99);
  });

  QUnit.test('Sets input type to "number"', function(assert) {
    var editor = new Editor({
      value: 123
    }).render();

    assert.deepEqual(editor.$el.attr('type'), 'number');
  });

  QUnit.test('Sets step="any" by default', function(assert) {
    var editor = new Editor().render();

    assert.deepEqual(editor.$el.attr('step'), 'any');
  });

  QUnit.test('Allows setting a custom step value', function(assert) {
    var editor = new Editor({
      schema: { editorAttrs: { step: 5 }}
    }).render();

    assert.deepEqual(editor.$el.attr('step'), '5');
  });

  QUnit.test('Allows setting a custom minimum value', function(assert) {
    var editor = new Editor({
      schema: { editorAttrs: { min: 150 }}
    }).render();

    assert.deepEqual(editor.$el.attr('min'), '150');
  });

  QUnit.test.todo("Restricts non-numeric characters", function(assert) {
    assert.ok(1);
  });

  QUnit.test("setValue() - updates the input value", function(assert) {
    var editor = new Editor({
      model: new Backbone.Model(),
      key: 'title'
    }).render();

    editor.setValue('2.4');

    assert.deepEqual(editor.getValue(), 2.4);
    assert.equal($(editor.el).val(), 2.4);
  });
  QUnit.test("setValue() - updates the model value", function(assert) {
    var editor = new Editor({
      model: new Backbone.Model(),
      key: 'title'
    }).render();

    editor.setValue('2.4');
    editor.render();

    assert.deepEqual(editor.getValue(), 2.4);
    assert.equal($(editor.el).val(), 2.4);
  });

  QUnit.test('setValue() - handles different types', function(assert) {
    var editor = new Editor().render();

    editor.setValue('123');
    assert.deepEqual(editor.getValue(), 123);

    editor.setValue('123.78');
    assert.deepEqual(editor.getValue(), 123.78);

    editor.setValue(undefined);
    assert.deepEqual(editor.getValue(), null);

    editor.setValue('');
    assert.deepEqual(editor.getValue(), null);

    editor.setValue(' ');
    assert.deepEqual(editor.getValue(), null);

    //For Firefox
    editor.setValue('heuo46fuek');
    assert.deepEqual(editor.getValue(), null);
  });

  QUnit.test('Uses Backbone.$ not global', function(assert) {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        value: 123
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    assert.ok(!exceptionCaught, ' using global \'$\' to render');
  });

  QUnit.module('Number events', {
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

  QUnit.test("'change' event - is triggered when value of input changes and is valid", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    var callCount = 0;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    // Pressing a valid key
    editor.$el.keypress($.Event("keypress", { charCode: 49 }));
    editor.$el.val('1');

    setTimeout(function(){
      callCount++;

      editor.$el.keyup();

      // Pressing an invalid key
      editor.$el.keypress($.Event("keypress", { charCode: 65 }));

      setTimeout(function(){
        editor.$el.keyup();

        // Pressing a valid key
        editor.$el.keypress($.Event("keypress", { charCode: 49 }));
        editor.$el.val('01');

        setTimeout(function(){
          callCount++;

          editor.$el.keyup();

          // Cmd+A; Backspace: Deleting everything
          editor.$el.keyup();
          editor.$el.val('');
          editor.$el.keyup();
          callCount++;

          assert.ok(spy.callCount == callCount);
          assert.ok(spy.alwaysCalledWith(editor));

          done();
        }, 0);
      }, 0);
    }, 0);
  });

  QUnit.test("'change' event - isn't triggered if the value doesn't change", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    // Number is 0 by default, pressing 0 again
    editor.$el.keypress($.Event("keypress", { charCode: 48 }));
    editor.$el.val('0');

    setTimeout(function() {
      assert.ok(spy.callCount === 0);

      done();
    }, 0);
  });

  QUnit.test("'change' event - is triggered when clicking the spinner ('input' event)", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$el.val('10');
    editor.$el.trigger('input');

    assert.ok(spy.callCount === 1);
  });


})(Backbone.Form, Backbone.Form.editors.Number);
