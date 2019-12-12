function showSuccess(message) {
    $.notify(message, {
        type: 'success',
        placement: {
            align: 'center'
        },
        z_index: 99999,
        delay: 1000
    });
}

function showError(message) {
    $.notify(message, {
        type: 'danger',
        placement: {
            align: 'center'
        },
        z_index: 99999,
        delay: 1000
    });
}
