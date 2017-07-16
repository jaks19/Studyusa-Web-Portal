 $('#sendAdd').click(function(e){
   e.preventDefault();
   let username = $('#whistlerClient').val(),
       subId = $('#whistlerSubId').val(),
       subTitle = $('#whistlerSubTitle').val(),
       file = document.getElementById('doc').files[0];
   getSignedRequestAndSend(file, username, subId, subTitle);
   $('#submitAdd').submit();
 });

function getSignedRequestAndSend(file, username, subId, subTitle){
  let request = new XMLHttpRequest();
  request.open('GET', '/index/' + username + '/submit/' + subId + '/s3/' + subTitle + '/upload/' + file.name + `/?file-type=${file.type}`, false);
  request.send();
  if (request.status === 200) { uploadFile(file, JSON.parse(request.responseText).signedUrl) }
  else { alert('Could not get signed URL.') }
}

function uploadFile(file, signedUrl){
  let request = new XMLHttpRequest();
  request.open('PUT', signedUrl, false);
  request.send(file);
  if (request.status !== 200) { alert('Could not upload file.') }
}