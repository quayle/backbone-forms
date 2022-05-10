;(function(Form, Editor) {

  QUnit.module('Text');

  var same = deepEqual;


  QUnit.module('Text#initialize');

  QUnit.test('Default type is text', function(assert) {
    var editor = new Editor().render();

    assert.equal($(editor.el).attr('type'), 'text');
  });

  QUnit.test('Type can be changed', function(assert) {
    var editor = new Editor({
      schema: { dataType: 'tel' }
    }).render();

    assert.equal($(editor.el).attr('type'), 'tel');
  });

  QUnit.test("previousValue should equal initial value", function() {
    var editor = new Editor({
      value: 'Test'
    }).render();

    assert.equal(editor.previousValue, 'Test');
  });

  QUnit.test('Uses Backbone.$ not global', function(assert) {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        value: 'Test'
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    assert.ok(!exceptionCaught, ' using global \'$\' to render');
  });


  QUnit.module('Text#getValue()');

  QUnit.test('Default value', function(assert) {
    var editor = new Editor().render();

    assert.equal(editor.getValue(), '');
  });

  QUnit.test('Custom value', function(assert) {
    var editor = new Editor({
      value: 'Test'
    }).render();

    assert.equal(editor.getValue(), 'Test');
  });

  QUnit.test('Value from model', function(assert) {
    var editor = new Editor({
      model: new Backbone.Model({ title: 'Danger Zone!' }),
      key: 'title'
    }).render();

    assert.equal(editor.getValue(), 'Danger Zone!');
  });

  QUnit.test('Value updates model', function(assert) {
		var model = new Backbone.Model({ title: 'Danger Zone!' });
    var editor = new Editor({
      model: model,
      key: 'title'
    }).render();
    editor.setValue("Updated Value");
		editor.render();
		assert.equal(editor.getValue(),"Updated Value");
  });



  QUnit.module('Text#setValue');

  QUnit.test('updates the input value', function(assert) {
    var editor = new Editor({
      key: 'title'
    }).render();

    editor.setValue('foobar');

    assert.equal(editor.getValue(), 'foobar');
    assert.equal($(editor.el).val(), 'foobar');
  });

  QUnit.test("previousValue should equal set value", function() {
    var editor = new Editor().render();

    editor.setValue('Test');

    assert.equal(editor.previousValue, 'Test');
  });



  QUnit.module('Text#focus', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor().render();

      //jQuery events only triggered when element is on the page
      //TODO: Stub methods so we don't need to add to the page
      $('body').append(this.editor.el);
    },

    afterEach: function() {
      this.sinon.restore();

      //Remove the editor from the page
      this.editor.remove();
    }
  });

  QUnit.test('gives focus to editor and its input', function(assert) {
    this.editor.focus();

    assert.ok(this.editor.hasFocus);
    assert.ok(this.editor.$el.is(':focus'));
  });

  QUnit.test('triggers the "focus" event', function(assert) {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });



  QUnit.module('Text#blur', {
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

  QUnit.test('removes focus from the editor and its input', function(assert) {
    var editor = this.editor;

    editor.focus();

    editor.blur();

    assert.ok(!editor.hasFocus);
    assert.ok(!editor.$el.is(':focus'));
  });

  QUnit.test('triggers the "blur" event', function(assert) {
    var editor = this.editor;

    editor.focus()

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.blur();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });



  QUnit.module('Text#select', {
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

  QUnit.test('triggers the "select" event', function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('select', spy);

    editor.select();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });



  QUnit.module('Text events', {
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

  QUnit.test("'change' event - is triggered when value of input changes", function() {
    var editor = this.editor;

    var callCount = 0;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    // Pressing a key
    editor.$el.keypress();
    editor.$el.val('a');

    stop();
    setTimeout(function(){
      callCount++;

      editor.$el.keyup();

      // Keeping a key pressed for a longer time
      editor.$el.keypress();
      editor.$el.val('ab');

      setTimeout(function(){
        callCount++;

        editor.$el.keypress();
        editor.$el.val('abb');

        setTimeout(function(){
          callCount++;

          editor.$el.keyup();

          // Cmd+A; Backspace: Deleting everything
          editor.$el.keyup();
          editor.$el.val('');
          editor.$el.keyup();
          callCount++;

          // Cmd+V: Pasting something
          editor.$el.val('abdef');
          editor.$el.keyup();
          callCount++;

          // Left; Right: Pointlessly moving around
          editor.$el.keyup();
          editor.$el.keyup();

          assert.ok(spy.callCount == callCount);
          assert.ok(spy.alwaysCalledWith(editor));

          start();
        }, 0);
      }, 0);
    }, 0);
  });

  QUnit.test("'focus' event - bubbles up from the input", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$el.focus();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
  });

  QUnit.test("'blur' event - bubbles up from the input", function() {
    var editor = this.editor;

    editor.$el.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$el.blur();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
  });

  QUnit.test("'select' event - bubbles up from the input", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('select', spy);

    editor.$el.select();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
  });


})(Backbone.Form, Backbone.Form.editors.Text);
