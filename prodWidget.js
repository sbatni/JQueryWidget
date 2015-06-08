
(function($) {
    var VALIDATORS = {
        required: function(value) {
            return !!value;
        },
        unique: function(value, options, selectedIndex) {
            for (var key=0, size=options.items.length; key<size;key++) {
                if(options.items[key][options.fieldName] === value) {
                    if(selectedIndex == -1) {
                        return false;
                    }
                    else if (key !== selectedIndex) {
                        return false;
                    }
                    
                }
            }
            return true;
        },
        number: function(value) {
            if(!!value) {
                return !isNaN(Number(value));
            }
            return false;
        }
    }

    var FORMATTER = {
        currencyFormatter: function(price) {
            var neg = false;
            if(price < 0) {
                neg = true;
                price = Math.abs(price);
            }
            return (neg ? "-$" : '$') + parseFloat(price, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
        }
    }

    $.widget("custom.prodWidget", {
        _init: function() {
        },

        _create: function() {
            this._grid = this.element.find('[data-part=grid]');
            this._rowTemplate = this._grid.find('[data-part=grid-row]').remove();
            this._form = this.element.find('[data-part=form]').get(0);
            this._items = [];
            this._counter = 1;
            this._selectedIndex = -1;
            this._itemFormatters = {'price': 'currencyFormatter'};
            this._rulesSet = {'name': { required: true },
                            'sku': { required: true, unique: { items: this._items, fieldName: 'sku' } },
                            'price': { required: true, number: true }};

            this._on(this._grid, {
                'click .delete': function(event) {
                    if(confirm("Delete selected product?")) {
                        var index = $(event.target).closest('tr').index();
                        $("tbody tr:eq(" + index + ")").remove();
                        this._items.splice(index, 1);
                    }
                },

                'click .edit': function(event) {
                    this._selectedIndex = $(event.target).closest('tr').index();
                    var product = this.getItem(this._selectedIndex);
                    this._trigger("editing", event, product);
                }
            });
            var _self = this;
            $.each(this._rulesSet, function(inputName, validators) {
                _self.validates(inputName, validators);
            });
            /*this.validates('name', { required: true });
            this.validates('sku', { required: true, unique: { items: this._items, fieldName: 'sku' } });
            this.validates('price', { required: true, number: true });*/
        },

        validates: function(fieldName, validators) {
            this._on(this._form[fieldName], { change: this._createEventHandlersFor(fieldName, validators) });
            return this;
        },

        _createEventHandlersFor: function(inputName, validators) {
            //call one more function as we are passing arguments
            return function(event) {
                var _self = this;
                var value = event.target.value;
                var fieldName;

                //fieldName = $('[name="' + inputName + '"]');
                fieldName = $(event.target);
                //var error_element=$("span", fieldName.parent());
                var error_element=fieldName.parent().find("span");
                var enableSave = true;
                $.each(validators, function(validatorName, options) {
                    var isValid = VALIDATORS[validatorName](value, options, _self._selectedIndex);
                    if(isValid) {
                        fieldName.removeClass("invalid").addClass("valid");
                        error_element.removeClass("error_show").addClass("error");
                    }
                    else {
                        fieldName.removeClass("valid").addClass("invalid");
                        error_element.removeClass("error").addClass("error_show");
                        enableSave = false;
                        return false;
                    }
                })
                if(enableSave) {
                    this._form.save.disabled = false;
                }
                else {
                    this._form.save.disabled = true;
                }
            };
        },

        getItem : function(index) {
            return this._items[index];
        },

        isValid: function(product) {
            var enableSave = true;
            var _self = this;
            $.each(this._rulesSet, function(inputName, validators) {

                var value = product[inputName];
                var fieldName = $('[name="' + inputName + '"]');
                var error_element=$("span", fieldName.parent());
                $.each(validators, function(validatorName, options) {
                    var isValid = VALIDATORS[validatorName](value, options, _self._selectedIndex);
                    if(isValid) {
                        fieldName.removeClass("invalid").addClass("valid");
                        error_element.removeClass("error_show").addClass("error");
                    }
                    else {
                        fieldName.removeClass("valid").addClass("invalid");
                        error_element.removeClass("error").addClass("error_show");
                        enableSave = false;
                        return false;
                    }
                })
            });
            return enableSave;
        },

        addItem : function(product) {
            if (this.isValid(product)) {
                //adding a product
                if(this._selectedIndex === -1) {
                    product.id = this._counter;
                    this._counter++;
                }
                this._grid.append(this._rowFor(product));
                this._items.push(product);
                this._form.save.disabled = true;
                this._selectedIndex = -1;
            }
        },

        updateItem : function(product) {
            this._grid.find('tbody tr').eq(this._selectedIndex).replaceWith(this._rowFor(product));

            //$("tbody tr:eq(" + index + ")").replaceWith(this._rowFor(product));
            this._items.splice(this._selectedIndex, product);
            this._form.save.disabled = true;
            this._selectedIndex = -1;
        },

        _rowFor: function(product) {
            var _self = this;
            var newNode = this._rowTemplate.clone();

            var html = newNode.html().replace(/\{\{\s*(\w+)\s*\}\}/g, function(match, capture) {
                //check if any formatters are defined for each key
                if(_self._itemFormatters[capture])
                {
                    return FORMATTER[_self._itemFormatters[capture]](product[capture]);
                }
                return product[capture];
            });

            return newNode.html(html);
        },

    });
}(jQuery));
