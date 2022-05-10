;(function(Form, Editor) {

  QUnit.module('Date', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();
    },

    afterEach: function() {
      this.sinon.restore();
    }
  });



  QUnit.test('initialize() - casts values to date', function(assert) {
    var date = new Date(2000, 0, 1);

    var editor = new Editor({ value: date.toString() });

    assert.deepEqual(editor.value.constructor.name, 'Date');
    assert.deepEqual(editor.value.getTime(), date.getTime());
  });

  QUnit.test('initialize() - default value - today', function(assert) {
    var editor = new Editor;

    var today = new Date,
        value = editor.value;

    assert.deepEqual(value.getFullYear(), today.getFullYear());
    assert.deepEqual(value.getMonth(), today.getMonth());
    assert.deepEqual(value.getDate(), today.getDate());
  });

  QUnit.test('initialize() - default options and schema', function(assert) {
    var editor = new Editor();

    var schema = editor.schema,
        options = editor.options;

    //Schema options
    var today = new Date;
    assert.deepEqual(schema.yearStart, today.getFullYear() - 100);
    assert.deepEqual(schema.yearEnd, today.getFullYear());

    //Options should default to those stored on the static class
    assert.deepEqual(editor.options.showMonthNames, Editor.showMonthNames);
    assert.deepEqual(editor.options.monthNames, Editor.monthNames);
  });

  QUnit.test('render()', function(assert) {
    var date = new Date,
        editor = new Editor({ value: date }),
        spy = this.sinon.spy(editor, 'setValue');

    editor.render();

    //Test DOM elements
    assert.deepEqual(editor.$date.attr('data-type'), 'date');
    assert.deepEqual(editor.$date.find('option:first').val(), '1');
    assert.deepEqual(editor.$date.find('option:last').val(), '31');
    assert.deepEqual(editor.$date.find('option:first').html(), '1');
    assert.deepEqual(editor.$date.find('option:last').html(), '31');

    assert.deepEqual(editor.$month.attr('data-type'), 'month');
    assert.deepEqual(editor.$month.find('option:first').val(), '0');
    assert.deepEqual(editor.$month.find('option:last').val(), '11');
    assert.deepEqual(editor.$month.find('option:first').html(), 'January');
    assert.deepEqual(editor.$month.find('option:last').html(), 'December');

    assert.deepEqual(editor.$year.attr('data-type'), 'year');
    assert.deepEqual(editor.$year.find('option:first').val(), editor.schema.yearStart.toString());
    assert.deepEqual(editor.$year.find('option:last').val(), editor.schema.yearEnd.toString());
    assert.deepEqual(editor.$year.find('option:first').html(), editor.schema.yearStart.toString());
    assert.deepEqual(editor.$year.find('option:last').html(), editor.schema.yearEnd.toString());

    assert.ok(spy.calledWith(date), 'Called setValue');
  });

  QUnit.test('render() - with showMonthNames false', function(assert) {
    var editor = new Editor({
      showMonthNames: false
    }).render();

    assert.deepEqual(editor.$month.attr('data-type'), 'month');
    assert.deepEqual(editor.$month.find('option:first').html(), '1');
    assert.deepEqual(editor.$month.find('option:last').html(), '12');
  });

  QUnit.test('render() - with yearStart after yearEnd', function(assert) {
    var editor = new Editor({
      schema: {
        yearStart: 2000,
        yearEnd: 1990
      }
    }).render();

    assert.deepEqual(editor.$year.find('option:first').val(), editor.schema.yearStart.toString());
    assert.deepEqual(editor.$year.find('option:last').val(), editor.schema.yearEnd.toString());
    assert.deepEqual(editor.$year.find('option:first').html(), editor.schema.yearStart.toString());
    assert.deepEqual(editor.$year.find('option:last').html(), editor.schema.yearEnd.toString());
  });

  QUnit.test('getValue() - returns a Date', function(assert) {
    var date = new Date(2010, 5, 5),
        editor = new Editor({ value: date }).render();

    var value = editor.getValue();

    assert.deepEqual(value.constructor.name, 'Date');
    assert.deepEqual(value.getTime(), date.getTime());
  });

  QUnit.test('setValue()', function(assert) {
    var date = new Date(2015, 1, 4);

    var editor = new Editor({
      schema: {
        yearStart: 2000,
        yearEnd: 2020
      }
    }).render();

    editor.setValue(date);

    assert.deepEqual(editor.$date.val(), '4');
    assert.deepEqual(editor.$month.val(), '1');
    assert.deepEqual(editor.$year.val(), '2015');

    assert.deepEqual(editor.getValue().getTime(), date.getTime());
  });

  QUnit.test('setValue() updates model', function(assert) {
    var date = new Date(2015, 1, 4);

    var editor = new Editor({
      schema: {
        yearStart: 2000,
        yearEnd: 2020
      }
    }).render();

    editor.setValue(date);
    editor.render();
    assert.deepEqual(editor.$date.val(), '4');
    assert.deepEqual(editor.$month.val(), '1');
    assert.deepEqual(editor.$year.val(), '2015');

    assert.deepEqual(editor.getValue().getTime(), date.getTime());
  });

  QUnit.test('updates the hidden input when a value changes', function(assert) {
    var date = new Date(2012, 2, 5);

    var editor = new Editor({
      schema: {
        yearStart: 2000,
        yearEnd: 2020
      },
      value: date
    }).render();

    //Simulate changing the date manually
    editor.$year.val(2020).trigger('change');
    editor.$month.val(6).trigger('change');
    editor.$date.val(13).trigger('change');

    var hiddenVal = new Date(editor.$hidden.val());

    assert.deepEqual(editor.getValue().getTime(), hiddenVal.getTime());
    assert.deepEqual(hiddenVal.getFullYear(), 2020);
    assert.deepEqual(hiddenVal.getMonth(), 6);
    assert.deepEqual(hiddenVal.getDate(), 13);
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

  QUnit.module('Date events', {
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

})(Backbone.Form, Backbone.Form.editors.Date);
