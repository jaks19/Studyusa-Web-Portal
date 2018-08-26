 $('button').click(function(e){
   if (!e.target.value || !(e.target.id == 'downloadAdd')){ return } // Because these buttons are created dynamically
   e.preventDefault();
   $('#pleaseWaitModal').modal('show');
   let username ='<%=client.username%>',
       subId = '<%=sub._id%>',
       subTitle = '<%=sub.title%>',
       fileName = e.target.value;
   getSignedRequestAndDownload(fileName, username, subId, subTitle);

   $('.modal').modal('hide');
 });

function getSignedRequestAndDownload(fileName, username, subId, subTitle){
  let request = new XMLHttpRequest();
  request.open('GET', '/index/' + username + '/submit/' + subId + '/s3/' + subTitle + '/download/' + fileName, false);
  request.send();
  if (request.status === 200) {
    const response = JSON.parse(request.responseText);
    downloadFile(response.signedUrl, response.fileName);
  }
  else{ alert('Could not get signed URL.') }
}

function downloadFile(signedUrl, fileName){
    $('body').append(`<a href="${signedUrl}" id="link" download="${fileName}"  style="visibility: hidden;">.</a>`);
    let toBeRemoved = document.getElementById("link");
    toBeRemoved.click();
    toBeRemoved.parentNode.removeChild(toBeRemoved);
}
