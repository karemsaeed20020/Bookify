// ========== GLOBAL VARIABLES ==========
var datatable;
var updatedRow;
var exportedCols = [];

// ========== HELPER FUNCTIONS ==========
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
        text: message.responseText != undefined ? message.responseText : message,
        customClass: {
            confirmButton: "btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary"
        }
    });
}

function disableSubmitButtons() {
    $('body :submit').attr("disabled", "disabled")
}

function onModalBegin() {
    disableSubmitButtons();
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

function onModalComplete() {
    $('body :submit').removeAttr('disabled').removeAttr('data-kt-indicator');
}

// ========== SELECT2 FUNCTIONS ==========
function applySelect2() {
    console.log('Applying Select2...');

    // Initialize Select2 on page load
    $('.js-select2').select2({
        width: '100%',
        placeholder: "Select an option",
        allowClear: true
    });

    // Fix validation
    $('.js-select2').on('select2:select', function (e) {
        $('form').not('#SignOut').validate().element('#' + $(this).attr('id'));
    });

    console.log('Select2 applied to', $('.js-select2').length, 'elements');
}

// Initialize Select2 in modal (AFTER content loads)
function initializeSelect2InModal() {
    console.log('Initializing Select2 in modal...');

    var selectElement = $('#Modal .js-select2');
    console.log('Found select elements in modal:', selectElement.length);

    if (selectElement.length > 0) {
        // Destroy any existing Select2 instances
        try {
            if (selectElement.hasClass('select2-hidden-accessible')) {
                selectElement.select2('destroy');
                console.log('Destroyed existing Select2 instance');
            }
        } catch (e) {
            console.log('No existing Select2 to destroy');
        }

        // Re-initialize with modal as parent
        selectElement.select2({
            width: '100%',
            placeholder: "Select roles",
            allowClear: true,
            dropdownParent: $('#Modal') // CRITICAL for modals
        });

        console.log('Select2 initialized in modal');
    }
}

// ========== DATATABLES FUNCTIONS ==========
function initDataTables() {
    var table = $('.js-datatables');

    if (table.length === 0) {
        console.log('No DataTables found');
        return;
    }

    console.log('Initializing DataTables...');

    // Get exportable columns
    var headers = $('th');
    exportedCols = [];
    $.each(headers, function (i) {
        if (!$(this).hasClass('js-no-export'))
            exportedCols.push(i);
    });

    // Initialize DataTable
    datatable = table.DataTable({
        "info": false,
        'pageLength': 10,
        "order": [[0, 'asc']],
        "language": {
            "emptyTable": "No data found",
            "zeroRecords": "No matching records found"
        }
    });

    // Search functionality
    $('[data-kt-filter="search"]').on('keyup', function () {
        datatable.search(this.value).draw();
    });

    console.log('DataTables initialized');
}

// ========== MAIN DOCUMENT READY ==========
$(document).ready(function () {
    console.log('Document ready - initializing...');

    // 1. Disable submit buttons on form submit
    $('form').not('#SignOut').on('submit', function () {
        // Handle TinyMCE if present
        if ($('.js-tinymce').length > 0) {
            $('.js-tinymce').each(function () {
                var input = $(this);
                var content = tinymce.get(input.attr('id')).getContent();
                input.val(content);
            });
        }

        var isValid = $(this).valid();
        if (isValid) disableSubmitButtons();
    });

    // 2. Initialize TinyMCE (if needed)
    if ($('.js-tinymce').length > 0) {
        console.log('Initializing TinyMCE...');
        var options = { selector: ".js-tinymce", height: "422" };

        if (KTThemeMode.getMode() === "dark") {
            options["skin"] = "oxide-dark";
            options["content_css"] = "dark";
        }

        tinymce.init(options);
    }

    // 3. Initialize Select2
    applySelect2();

    // 4. Initialize Datepicker
    if ($('.js-datepicker').length > 0) {
        console.log('Initializing Datepicker...');
        $('.js-datepicker').daterangepicker({
            singleDatePicker: true,
            autoApply: true,
            drops: 'up',
            maxDate: new Date()
        });
    }

    // 5. Show success message if any
    var message = $('#Message').text();
    if (message !== '') {
        showSuccessMessage(message);
    }

    // 6. Initialize DataTables
    initDataTables();

    // ========== MODAL HANDLING ==========
    // Handle modal open
    $('body').on('click', '.js-render-modal', function () {
        console.log('Modal button clicked');

        var btn = $(this);
        var modal = $('#Modal');

        modal.find('#ModalLabel').text(btn.data('title'));

        if (btn.data('update') !== undefined) {
            updatedRow = btn.parents('tr');
            console.log('Update mode for row:', updatedRow);
        }

        // Load form via AJAX
        $.get({
            url: btn.data('url'),
            success: function (form) {
                console.log('Form loaded successfully');
                modal.find('.modal-body').html(form);

                // Re-parse validation
                $.validator.unobtrusive.parse(modal);

                // RE-INITIALIZE SELECT2 IN MODAL (CRITICAL!)
                setTimeout(function () {
                    initializeSelect2InModal();
                }, 100);
            },
            error: function (xhr, status, error) {
                console.error('Error loading form:', error);
                showErrorMessage('Failed to load form');
            }
        });

        // Show modal
        modal.modal('show');

        // Also initialize Select2 when modal is fully shown
        modal.on('shown.bs.modal', function () {
            console.log('Modal fully shown, initializing Select2...');
            setTimeout(function () {
                initializeSelect2InModal();
            }, 300);
        });
    });

    // ========== TOGGLE STATUS ==========
    $('body').on('click', '.js-toggle-status', function (e) {
        e.preventDefault();
        var btn = $(this);
        var row = btn.parents('tr');
        var currentStatus = row.find('.js-status').text().trim();
        var newStatus = currentStatus === 'Deleted' ? 'Available' : 'Deleted';

        Swal.fire({
            title: 'Are you sure?',
            text: `Change status from ${currentStatus} to ${newStatus}?`,
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

                        // Update timestamp
                        row.find('.js-updated-on').html(lastUpdatedOn);

                        // Add animation
                        row.addClass('animate__animated animate__flash');
                        setTimeout(function () {
                            row.removeClass('animate__animated animate__flash');
                        }, 1000);

                        showSuccessMessage('Status updated successfully!');
                    },
                    error: function () {
                        showErrorMessage('Failed to update status');
                    }
                });
            }
        });
    });
    //Handle Confirm
    $('body').delegate('.js-confirm', 'click', function () {
        var btn = $(this);

        bootbox.confirm({
            message: btn.data('message'),
            buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                if (result) {
                    $.post({
                        url: btn.data('url'),
                        data: {
                            '__RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
                        },
                        success: function () {
                            showSuccessMessage();
                        },
                        error: function () {
                            showErrorMessage();
                        }
                    });
                }
            }
        });
    });


    // ========== SIGNOUT ==========
    $('.js-signout').on('click', function () {
        $('#SignOut').submit();
    });

    console.log('Initialization complete');
});