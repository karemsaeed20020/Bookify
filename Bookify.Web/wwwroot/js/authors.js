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

function onModalBegin() {
    console.log('Modal begin - disabling submit buttons');
    $('body :submit').attr("disabled", "disabled");
}

function onModalSuccess(row) {
    console.log('Modal success - operation completed');
    showSuccessMessage();
    $('#Modal').modal('hide');

    if (updatedRow !== undefined) {
        datatable.row(updatedRow).remove().draw();
        updatedRow = undefined;
    }

    var newRow = $(row);
    datatable.row.add(newRow).draw();

    // Reinitialize menus if needed
    if (typeof KTMenu !== 'undefined') {
        KTMenu.init();
        KTMenu.initHandlers();
    }
}

function onModalFailure(xhr) {
    console.log('Modal failure - enabling submit buttons');
    $('body :submit').removeAttr('disabled');

    if (xhr.status === 400) {
        // Validation errors - update the form with validation messages
        $('#Modal .modal-body').html(xhr.responseText);
        $.validator.unobtrusive.parse($('#Modal form'));
    } else {
        showErrorMessage('An error occurred while processing your request.');
    }
}

function onModalComplete() {
    console.log('Modal complete - enabling submit buttons');
    $('body :submit').removeAttr('disabled');
}

// DataTables
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
            "order": []
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
                if (target) {
                    target.click();
                }
            });
        });
    }

    // Search Datatable --- official docs reference: https://datatables.net/reference/api/search()
    var handleSearchDatatable = () => {
        const filterSearch = document.querySelector('[data-kt-filter="search"]');
        if (filterSearch) {
            filterSearch.addEventListener('keyup', function (e) {
                datatable.search(e.target.value).draw();
            });
        }
    }

    // Public methods
    return {
        init: function () {
            table = document.querySelector('.js-datatables');

            if (!table) {
                console.warn('DataTable element not found');
                return;
            }

            initDatatable();
            exportButtons();
            handleSearchDatatable();
        }
    };
}();

$(document).ready(function () {
    console.log('Document ready - initializing authors page');

    // Check if modal exists
    if ($('#Modal').length === 0) {
        console.error('❌ MODAL NOT FOUND: No element with ID "Modal" exists on the page!');
        showErrorMessage('Modal container not found. Please check the page HTML.');
    } else {
        console.log('✅ Modal found on page');
    }

    var message = $('#Message').text();
    if (message !== '') {
        showSuccessMessage(message);
    }

    // DataTables Initialization
    if (typeof KTUtil !== 'undefined') {
        KTUtil.onDOMContentLoaded(function () {
            KTDatatables.init();
        });
    } else {
        KTDatatables.init();
    }

    // Handle bootstrap modal
    $('body').delegate('.js-render-modal', 'click', function () {
        var btn = $(this);
        var modal = $('#Modal');

        console.log('Add button clicked, loading modal...');

        modal.find('#ModalLabel').text(btn.data('title'));

        if (btn.data('update') !== undefined) {
            updatedRow = btn.parents('tr');
            console.log('Update mode - row stored:', updatedRow);
        }

        // Show loading state in modal
        modal.find('.modal-body').html(`
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading form...</p>
            </div>
        `);

        // Show modal first
        modal.modal('show');

        // Then load the form content
        $.get({
            url: btn.data('url'),
            success: function (form) {
                console.log('Form loaded successfully');
                modal.find('.modal-body').html(form);
                $.validator.unobtrusive.parse(modal);
            },
            error: function (xhr, status, error) {
                console.error('Error loading form:', error);
                modal.find('.modal-body').html(`
                    <div class="alert alert-danger">
                        <h6>Error Loading Form</h6>
                        <p>Failed to load the form. Please try again.</p>
                    </div>
                `);
                showErrorMessage('Failed to load form. Please try again.');
            }
        });
    });

    // Handle Toggle Status with SweetAlert
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