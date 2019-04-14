object = {
    sendEmail: (e) => {

        e.preventDefault();

        if ($('#sendEmail')[0].checkValidity()) {

            var formdata = $('#sendEmail').serializeArray();
         //   formdata.length--;

            formdata.push({
                name: "type",
                value: "email-ticket"
            }, {
                name: "template",
                value: "general"
            })

            let apiObj = {};
            formdata.forEach( data => {
                apiObj[data.name] = data.value;
            });


            $('#sendEmailButton').html('<span class=\"spinner-grow spinner-grow-sm text-success\" role=\"status\" aria-hidden=\"true\"></span>Sending...<span class=\"spinner-grow spinner-grow-sm text-success\" role=\"status\" aria-hidden=\"true\"></span>')

            console.log('TEST', apiObj);
            postApi('/mailer', apiObj, 'mailer');

        } else {
            $('#sendEmail')[0].reportValidity()
        }

    },
    openWork(e) {
        let id = e.target.id;
        userApp.openedWork = id;
        $('#workModal').modal('show');
    }
}