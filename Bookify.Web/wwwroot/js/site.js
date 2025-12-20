var datatable;
var updatedRow;
var exportedCols = [];

function showSuccessMessage(message = 'Saved successfully!') {
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        customClass: {
            confirmButton: "btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary"
        }
    });
}

function showErrorMessage(message = 'Something went wrong!') {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
        customClass: {
            confirmButton: "btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary"
        }
    });
}

function disbableSubmitButtons() {
    $('body :submit').attr("disabled", "disabled")
}
function onModalBegin() {
    disbableSubmitButtons();
}
function onModalSuccess(row) {
    showSuccessMessage();
    $('#Modal').modal('hide');

    if (updatedRow !== undefined) {
        datatable.row(updatedRow).remove().draw();
        updatedRow = undefined;
    }

    var newRow = $(row);
    datatable.row.add(newRow).draw();

    KTMenu.init();
    KTMenu.initHandlers();
}

//DataTables
var headers = $('th');
$.each(headers, function (i) {
    if (!$(this).hasClass('js-no-export'))
        exportedCols.push(i);
});

// Class definition
var KTDatatables = function () {
    // Private functions
    var initDatatable = function () {
        // Init datatable --- more info on datatables: https://datatables.net/manual/
        datatable = $(table).DataTable({
            "info": false,
            'pageLength': 10,
        });
    }

    // Hook export buttons
    var exportButtons = () => {
        const documentTitle = $('.js-datatables').data('document-title');
        var buttons = new $.fn.dataTable.Buttons(table, {
            buttons: [
                {
                    extend: 'copyHtml5',
                    title: documentTitle,
                    exportOptions: {
                        columns: exportedCols
                    }
                },
                {
                    extend: 'excelHtml5',
                    title: documentTitle,
                    exportOptions: {
                        columns: exportedCols
                    }
                },
                {
                    extend: 'csvHtml5',
                    title: documentTitle,
                    exportOptions: {
                        columns: exportedCols
                    }
                },
                {
                    extend: 'pdfHtml5',
                    title: documentTitle,
                    exportOptions: {
                        columns: exportedCols
                    }
                }
            ]
        }).container().appendTo($('#kt_datatable_example_buttons'));

        // Hook dropdown menu click event to datatable export buttons
        const exportButtons = document.querySelectorAll('#kt_datatable_example_export_menu [data-kt-export]');
        exportButtons.forEach(exportButton => {
            exportButton.addEventListener('click', e => {
                e.preventDefault();

                // Get clicked export value
                const exportValue = e.target.getAttribute('data-kt-export');
                const target = document.querySelector('.dt-buttons .buttons-' + exportValue);

                // Trigger click event on hidden datatable export buttons
                target.click();
            });
        });
    }

    // Search Datatable --- official docs reference: https://datatables.net/reference/api/search()
    var handleSearchDatatable = () => {
        const filterSearch = document.querySelector('[data-kt-filter="search"]');
        filterSearch.addEventListener('keyup', function (e) {
            datatable.search(e.target.value).draw();
        });
    }

    // Public methods
    return {
        init: function () {
            table = document.querySelector('.js-datatables');

            if (!table) {
                return;
            }

            initDatatable();
            exportButtons();
            handleSearchDatatable();
        }
    };
}();

$(document).ready(function () {
    // disable submit buttons on form submit
    $('form').on('submit', function () {
        var isValid = $(this).valid();
        if (isValid) disbableSubmitButtons();
    });
    //TinyMCE
    if ($('.js-tinymce').length > 0) {
        var options = { selector: ".js-tinymce", height: "422" };

        if (KTThemeMode.getMode() === "dark") {
            options["skin"] = "oxide-dark";
            options["content_css"] = "dark";
        }

        tinymce.init(options);
    }
 
    //Select2
    $('.js-select2').select2();
    $('.js-select2').on('select2:select', function (e) {
        $("form").validate().element("#"+ $(this).attr("id"));
    });

    //Datepicker
    $('.js-datepicker').daterangepicker({
        singleDatePicker: true,
        autoApply: true,
        drops: 'up',
        maxDate: new Date()
    });


    var message = $('#Message').text();
    if (message !== '') {
        showSuccessMessage(message);
    }

    //DataTables Initialization
    KTUtil.onDOMContentLoaded(function () {
        KTDatatables.init();
    });

    //Handle bootstrap modal
    $('body').delegate('.js-render-modal', 'click', function () {
        var btn = $(this);
        var modal = $('#Modal');

        modal.find('#ModalLabel').text(btn.data('title'));

        if (btn.data('update') !== undefined) {
            updatedRow = btn.parents('tr');
            console.log(updatedRow);
        }

        $.get({
            url: btn.data('url'),
            success: function (form) {
                modal.find('.modal-body').html(form);
                $.validator.unobtrusive.parse(modal);
            },
            error: function () {
                showErrorMessage();
            }
        });

        modal.modal('show');
    });

    //Handle Toggle Status with SweetAlert
    $('body').delegate('.js-toggle-status', 'click', function () {
        var btn = $(this);
        var row = btn.parents('tr');
        var currentStatus = row.find('.js-status').text().trim();
        var newStatus = currentStatus === 'Deleted' ? 'Available' : 'Deleted';

        Swal.fire({
            title: 'Are you sure?',
            text: `You want to change status from ${currentStatus} to ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, toggle it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: "btn btn-danger",
                cancelButton: "btn btn-secondary"
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                $.post({
                    url: btn.data('url'),
                    data: {
                        '__RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
                    },
                    success: function (lastUpdatedOn) {
                        var status = row.find('.js-status');

                        status.text(newStatus);

                        if (newStatus === 'Available') {
                            status.removeClass('badge-light-danger').addClass('badge-light-success');
                        } else {
                            status.removeClass('badge-light-success').addClass('badge-light-danger');
                        }

                        // Update last updated timestamp
                        row.find('.js-updated-on').html(lastUpdatedOn);

                        // Add animation
                        row.addClass('animate__animated animate__flash');

                        // Remove animation after it completes
                        setTimeout(function () {
                            row.removeClass('animate__animated animate__flash');
                        }, 1000);

                        showSuccessMessage('Status updated successfully!');
                    },
                    error: function () {
                        showErrorMessage('Failed to update status. Please try again.');
                    }
                });
            }
        });
    });
});