require(['jquery', 'uikit!sortable', 'domReady!'], function($, uikit) {

    var form = $('#js-widgets');

    // action button
    form.on('click', '[data-action]', function(e) {
        e.preventDefault();
        form.attr('action', $(this).data('action')).submit();
    });

    // select all checkbox
    form.on('click', '.js-select-all:checkbox', function() {
        $('[name="ids[]"]:checkbox', form).prop('checked', $(this).prop('checked'));
    });

    // save widgets order on sortable change
    form.on('sortable-change', 'ul.uk-sortable', function(e, item, action) {

        var list = $(this);

        $.post(form.data('reorder'), { position: list.data('position'), order: list.data('uksortable').serialize() }, function(data) {
            if (action == 'added' || action == 'moved') {
                uikit.notify(data.message, 'succes');
            }
        });

        list.find('select[name^="positions"]').val(list.data('position'));
    });

    // change position via selectbox
    form.on('change', 'select[name^="positions"]', function() {

        var select = $(this),
            li = select.closest('li'),
            current = li.parent(),
            target = $('ul[data-position="' + select.val() + '"]');


        target.find('.uk-sortable-empty').remove().end().append(li);

        if (!current.children().length) {
            if (current.data('position')) {
                current.append('<li class="uk-sortable-empty"></li>');
            } else {
                current.parent().addClass('uk-hidden');
            }
        }

        target.parent().removeClass('uk-hidden');

        current.trigger('sortable-change');
        target.trigger('sortable-change');

        applyFilters();
    });

    form.on('change', 'select[name^="filter"]', function() {
        applyFilters();
    });

    var positions = $('.js-position').each(function() {

        var ele  = $(this),
            list = ele.find('ul.uk-sortable');

        ele.toggleClass('uk-hidden', list.children('li').length < 1);
    });

    var filters = form.find(':input[id^="filter"]').each(function() {
        $(this).val(sessionStorage['widgets-filter-' + this.id] || '');
    });

    var filter = {
        pos    : $('#filter-position'),
        title  : $('#filter-title'),
        status : $('#filter-status'),
        type   : $('#filter-type')
    };

    applyFilters();

    function applyFilters() {

        var pos = filter.pos.val();

        if (pos) {
            positions.each(function() {
                var ele = $(this);
                ele.toggleClass('uk-hidden', ele.data('position') != pos);
            });
        } else {
            positions.removeClass('uk-hidden').show();
        }

        var pos_visible = positions.filter(':visible'),
            widgets     = pos_visible.find('.js-widget');

        var title  = filter.title.val().toLowerCase(),
            status = filter.status.val(),
            type   = filter.type.val();

        widgets.each(function() {

            var ele = $(this);

            ele.toggle((title ? ele.data('title').toLowerCase().indexOf(title) !== -1 : true) &&
                (status == '' ? true : (status == ele.data('status'))) &&
                (type == '' ? true : (type == ele.data('type'))));
        });

        pos_visible.each(function() {

            var ele = $(this);

            ele.toggleClass('uk-hidden', ele.find('.js-widget:visible').length < 1);
        });

        filters.each(function() {
            sessionStorage['widgets-filter-' + this.id] = $(this).val();
        });
    }

    $('#filter-title').on('keyup', uikit.Utils.debounce(function() {
        applyFilters();
    }, 200));

});