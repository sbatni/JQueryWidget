/**
 * Created by sbatni on 5/29/2015.
 */
$(function() {

    $( "#prodManagement" ).prodWidget();

    $("[name=save]").disabled = true;

    $("[name=save]").click(function(event){

        var product = {
            sku: $('[name="sku"]').val(),
            name: $('[name="name"]').val(),
            price: $('[name="price"]').val(),
            id: $('[name="id"]').val()
        };
        var id = $('[name="prodid"]').val();
        if(!id) {
            $( "#prodManagement" ).prodWidget("addItem", product);
        }
        else
        {
            $( "#prodManagement" ).prodWidget("updateItem", product);
        }

        $('[name="name"]').val("");
        $('[name="sku"]').val("");
        $('[name="price"]').val("");
        $('[name="prodid"]').val("");

        event.preventDefault();
        event.stopPropagation();

    });

    $( "#prodManagement" ).on( "prodwidgetediting", function( event, product) {
        $('[name="name"]').val(product.name);
        $('[name="sku"]').val(product.sku);
        $('[name="price"]').val(product.price);
        $('[name="prodid"]').val(product.id);
    });

});