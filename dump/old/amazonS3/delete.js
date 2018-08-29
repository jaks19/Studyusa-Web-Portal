 $('button').click(function(e){
    e.preventDefault();
    if (!e.target.value || !(e.target.id == 'deleteAdd')){ return } // Because these buttons are created dynamically
    let username = '<%=client.username%>',
        subTitle = '<%=sub.title%>',
        fileName = e.target.value,
        request = new XMLHttpRequest();
    request.open('GET', '/index/' + username + '/submit/' + subTitle + '/s3/delete/' + `?file-name=${fileName}`, false);
    request.send();
    if (request.status !== 200) { alert('Could not delete from backend.') }
 });
