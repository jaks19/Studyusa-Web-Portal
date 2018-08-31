// Goes on the front-end of the payment form to validate the input data
//  and get a Token from Stripe
Stripe.setPublishableKey('pk_test_lHwDrvvFC4a3KxkfrrZPml3V');

  let $form = $('#paymentForm');
  $form.submit(function(event) {
    
    // Disable the submit button to prevent repeated clicks:
    $form.find('#butt').prop('disabled', true);
    $form.find('#errorMsg').addClass('hidden');
    
    // Request a token from Stripe:
    Stripe.card.createToken({
        number: $('#cardNumber').val(),
        exp_month: $('#month').val(),
        exp_year: $('#year').val(),
        cvc: $('#cvc').val(),
        name: $('#name').val(),
        address_line1: $('#street').val(),
        address_line2: $('#apt').val(),
        address_city: $('#city').val(),
        address_state: $('#state').val(),
        address_zip: $('#zip').val(),
        address_country: $('#country').val()
    }, stripeResponseHandler);

    // Prevent the form from being submitted:
    return false;
  });

function stripeResponseHandler(status, response) {
  if (response.error) {
    $('#errorMsg').text(response.error.message);
    $('#errorMsg').removeClass('hidden');
    $form.find('#butt').prop('disabled', false);
  } else {
    var tokenId = response.id;
    // Insert the token ID into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripeToken" id="stripeToken">').val(tokenId));
    $form.get(0).submit();
  }
};