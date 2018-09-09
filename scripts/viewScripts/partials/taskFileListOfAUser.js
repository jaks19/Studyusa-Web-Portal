// Shows a modal with a tinyMCE editor in read-only mode
// Purpose is to show a file submitted in the past without the possibility of editing it
// Could have just displayed the html but some inherited css ruins the formatting
let modalTinyMCE= new tingle.modal({
    footer: false,
    stickyFooter: false,
    cssClass: [ 'modal-tiny-mce' ],
    closeMethods: [ 'button' ],
    closeLabel: 'Close', // For mobile
    onClose: function() {
        tinymce.remove();
    },
    onOpen: function() {
        tinymce.init({
            selector: '#areaId',
            height: 500,
            theme: 'modern',
            readonly: 1,
            branding: false,
            menubar: false,
            statusbar: false,
            toolbar: false
        });
    }
});


// When user chooses a file to view, the link clicked has class 'downloadFile'
// A call is made to our API to get a signed URL to then download the file from Amazon S3
// This function makes the call to our API for the signed URL and used the 'downloadFile' function
// to get the contents from Amazon S3
$('.downloadFile').click(function(e){
    e.preventDefault();

    let requestToApiForSignedS3URL = new XMLHttpRequest();
    let uploadedDocumentId = $(this).data('document-id');
    let documentName = $(this).data('document-name');
    requestToApiForSignedS3URL.open('GET', `/api/s3download/${uploadedDocumentId}`, false);
    requestToApiForSignedS3URL.send();

   if (requestToApiForSignedS3URL.status === 200) {
     const response = JSON.parse(requestToApiForSignedS3URL.responseText);
     downloadFile(response.signedUrl, documentName);
   }

   else{ alert('Could not get signed URL.') }
   return;
});


 // Downloads user's selected file from Amazon S3 using the signed URL obtained from backend
 // Document name provided is obtained from somewhere else when user has clicked on the link for a specific file
 function downloadFile(signedUrl, documentName){
     let requestForFileData = new XMLHttpRequest();
     requestForFileData.open('GET', signedUrl, false);
     requestForFileData.send();

     if (requestForFileData.status === 200) {
         showFile(requestForFileData.responseText);
     }

     else{ alert('Could not get File to read.') }
     return;
 }


 // Shows the user's file contents in a text area, when provided with the file's contents
 // from Amazon S3
 function showFile (responseTextFromAmazonS3File) {
     modalTinyMCE.open();
     modalTinyMCE.setContent(
         `<div>
            <textarea id='areaId'></textarea>
          </div>
          <div style='text-align: center; margin-top:2%;'>
            <small class='text-muted'>Scroll down to see the whole document</small>
         </div>`
     );

     $('#areaId').text(responseTextFromAmazonS3File);
 }
