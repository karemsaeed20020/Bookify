// ========== VALIDATION SETUP ==========
$.validator.setDefaults({
    errorClass: "is-invalid",
    validClass: "is-valid",
    errorElement: "span",
    highlight: function (element, errorClass, validClass) {
        $(element).addClass(errorClass).removeClass(validClass);
    },
    unhighlight: function (element, errorClass, validClass) {
        $(element).addClass(validClass).removeClass(errorClass);
    },
    errorPlacement: function (error, element) {
        error.addClass('invalid-feedback d-block');
        error.insertAfter(element);
    }
});

$.validator.unobtrusive.options = {
    errorClass: 'is-invalid',
    validClass: 'is-valid'
};