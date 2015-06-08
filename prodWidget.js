(function($) {
    var VALIDATORS = {
        required: function(value) {
            return !!value;
        },
        unique: function(value, options) {
            for (var key=0, size=options.items.length; key<size;key++) {
                if(options.items[key][options.fieldName] === value && key !== options.selectedIndex) {
                    return false;
                }
            }
            return true;
        },
        number: function(value) {
            if(!!value) {
                return (!isNaN(Number(value)) && value > 0);
            }
            return false;
        }
    }

    var FORMATTER = {
        currencyFormatter: function(price) {
            return '$' + parseFloat(price, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').toString();
        }
    }

    $.widget('custom.prodWidget', {
        _init: function() {
        },

        _create: function() {
            this._grid = this.element.find('[data-part=grid]');
            this._rowTemplate = this._grid.find('[data-part=grid-row]').remove();
            this._form = this.element.find('[data-part=form]').get(0);
            this._items = [];
            this._productId = 1;
            this._selectedIndex = -1;
            this._itemFormatters = {'price': 'currencyFormatter'};

            this._on(this._grid, {
                'click .delete': function(event) {
                    if(confirm('Delete selected product?')) {
                        var index = $(event.target).closest('tr').index();
                        this._grid.find('tbody tr').eq(index).remove();
                        this._items.splice(index, 1);
                    }
                },

                'click .edit': function(event) {
                    this._selectedIndex = $(event.target).closest('tr').index();
                    var product = this.getItem(this._selectedIndex);
                    this._trigger('editing', event, product);
                }
            });

            this.validates('name', { required: true });
            this.validates('sku', { required: true, unique: { items: this._items, fieldName: 'sku',
                                    selectedIndex: this._selectedIndex } });
            this.validates('price', { required: true, number: true });
        },

        validates: function(fieldName, validators) {
            this._on(this._form[fieldName], { change: this._createEventHandlersFor(fieldName, validators) });
            return this;
        },

        _createEventHandlersFor: function(inputName, validators) {
            return function(event) {
                var _self = this;
                var value = event.target.value;
                var field = $(event.target);
                var errorField = field.parent().find('span');

                $.each(validators, function(validatorName, options) {
                    var isValid = VALIDATORS[validatorName](value, options);
                    _self._setStyle(isValid, field, errorField);
                    if(!isValid) {
                        return false;
                    }
                })
                var invalid = (this.element.find('span.error').length > 0 ||
                                    this.element.find('span.init').length > 0);
                this._form.save.disabled = invalid;
            };
        },


        _setStyle: function(success, field, errorField) {
            if(success) {
                field.removeClass('invalid').addClass('valid');
                errorField.removeClass('error').removeClass('init').addClass('success');
            }
            else {
                field.removeClass('valid').addClass('invalid');
                errorField.removeClass('success').removeClass('init').addClass('error');
            }
        },

        getItem : function(index) {
            return this._items[index];
        },

        saveItem: function(product) {
            event.preventDefault();

            if (!product.id) {
                product.id = this._productId;
                this._productId++;
                this._grid.append(this._rowFor(product));
                this._items.push(product);
            }
            else {
                this._grid.find('tbody tr').eq(this._selectedIndex).replaceWith(this._rowFor(product));
                this._items[this._selectedIndex] = product;
            }
            this.resetFormFields();
            this._form.save.disabled = true;
            this._selectedIndex = -1;
        },

        _rowFor: function(product) {
            var _self = this;
            var newNode = this._rowTemplate.clone();

            var html = newNode.html().replace(/\{\{\s*(\w+)\s*\}\}/g, function(match, capture) {
                if(_self._hasFormatterFor(capture)) {
                    return FORMATTER[_self._itemFormatters[capture]](product[capture]);
                }
                return product[capture];
            });

            return newNode.html(html);
        },

        _hasFormatterFor: function(field) {
            var _self = this;
            return _self._itemFormatters[field];
        },

        productFromForm : function() {
            var self = this;
            var product = 'name sku price id'.split(' ').reduce(function(product, fieldName) {
                product[fieldName] = self._form[fieldName].value;
                return product;
            }, {});

            return product;
        },

        productToForm: function(object) {
            var field;
            for (var key in object) {
                field = this._form[key];
                field.value = object[key];
            }
        },

        resetFormFields: function() {
            this._form.name.value = '';
            this._form.sku.value = '';
            this._form.price.value = '';
            this._form.id.value = '';
            $(this._form.span).removeClass('error').removeClass('success').addClass('init');
        }

    });
}(jQuery));
