/**
 * Object editor
 *
 * Creates a child form. For editing Javascript objects
 *
 * @param {Object} options
 * @param {Form} options.form                 The form this editor belongs to; used to determine the constructor for the nested form
 * @param {Object} options.schema             The schema for the object
 * @param {Object} options.schema.subSchema   The schema for the nested form
 */
Form.editors.Object = Form.editors.Base.extend({
  //Prevent error classes being set on the main control; they are internally on the individual fields
  hasNestedForm: true,

  initialize: function(options) {
    //Set default value for the instance so it's not a shared object
    this.value = {};

    //Init
    Form.editors.Base.prototype.initialize.call(this, options);

    //Check required options
    if (!this.form) throw new Error('Missing required option "form"');
    if (!this.schema.subSchema) throw new Error("Missing required 'schema.subSchema' option for Object editor");

    //Get the constructor for creating the nested form; i.e. the same constructor as used by the parent form
    var NestedForm = this.form.NestedForm;

    //Create the nested form
    this.nestedForm = new NestedForm({
      schema: this.schema.subSchema,
      data: this.value,
      idPrefix: this.id + '_',
      Field: NestedForm.NestedField,
      Fieldset: NestedForm.Fieldset
    });
    this.nestedForm.render();
  },

  render: function() {
    this._observeFormEvents();

    this.$el.html(this.nestedForm.el);

    if (this.hasFocus) this.trigger('blur', this);

    return this;
  },

  getValue: function() {
    if (this.nestedForm) {
      return this.nestedForm.getValue();
    }

    return this.value;
  },

  setValue: function(value) {
    this.value = value;

    this.nestedForm.setValue(this.value);
  },

  focus: function() {
    if (this.hasFocus) return;

    this.nestedForm.focus();
  },

  blur: function() {
    if (!this.hasFocus) return;

    this.nestedForm.blur();
  },

  remove: function() {
    this.nestedForm.remove();

    Backbone.View.prototype.remove.call(this);
  },

  validate: function() {
    var errors = _.extend({},
      Form.editors.Base.prototype.validate.call(this),
      this.nestedForm.validate()
    );
    var hasErrors = _.compact(errors).length ? true : false;
    if (!hasErrors) {
      return null;
    }
    return errors;
  },

  _observeFormEvents: function() {
    if (!this.nestedForm) {
      return;
    }

    this.nestedForm.on('all', function() {
      // args = ["key:change", form, fieldEditor]
      var args = _.toArray(arguments);
      args[1] = this;
      // args = ["key:change", this=objectEditor, fieldEditor]

      this.trigger.apply(this, args);
    }, this);
  }

});
