function showSuccessMessage(message = 'Saved Successfully!') {
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        customClass: {
            confirmButton: 'btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary'
        }
    })
}

function showErrorMessage(message = 'Something went wrong!') {
    Swal.fire({
        icon: 'error',
        title: 'Oops...!',
        text: message,
        customClass: {
            confirmButton: 'btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary' // Fixed: removed nested object
        }
    })
}
$(document).ready(function () {
    var message = $('#Message').text();
    if (message !== '') {
        showSuccessMessage(message);
    }
    // Handle bootstrap Modal
    $('.js-render-modal').on('click', function () {
        var modal = $('#Modal');
        var btn = $(this);
        modal.find('#ModalLabel').text(btn.data('title'));
        $.get({
            url: btn.data('url'),
            success: function (form) {
                modal.find('.modal-body').html(form);
                $.validator.unobtrusive.parse(modal);  
            },
            error: function () {
                showErrorMessage();
            }
        })
        modal.modal('show');

    })
})