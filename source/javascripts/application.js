//= require libs/all
//
$(document).ready(function(){
  //$('textarea').autoResize({minHeight: 35, animate: 200 });
  //
  $('section.contacts').each(function(){
    $(this).find('button').click(function(e){
      e.preventDefault();
      var message = $('form textarea').last().val();
      if(message != ""){
        $.post('/send_message.json', { 'message': message})
      .complete(function(data) {
        $('form').css('visibility', 'hidden');
        $('.message-sent').show();
      });
      }
    });
  });
});
