/**
 * Created by sbatni on 5/29/2015.
 */
$(function() {

    $( '#prodManagement' ).prodWidget();

    $('[name=save]').click(function(event) {
        var product = $( '#prodManagement').prodWidget('productFromForm');
        $( '#prodManagement' ).prodWidget('saveItem', product);
    });

    $( '#prodManagement' ).on( 'prodwidgetediting', function( event, product) {
        $( '#prodManagement').prodWidget('productToForm', product);
    });

});