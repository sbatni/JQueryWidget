/**
 * Created by sbatni on 5/29/2015.
 */
$(function() {

  var widget = $('#prodManagement').prodWidget();

  $('[name=save]').click(function(event) {
    var product = widget.prodWidget('extractProduct');
    widget.prodWidget('saveItem', product);
  });

  $('#prodManagement').on('prodwidgetediting', function(event, product) {
    widget.prodWidget('populateProduct', product);
  });

});
