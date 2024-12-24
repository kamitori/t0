
function getAllSearchFields() {
    var input_names = [];
    $.each($('#search-form').find('input'), function() {
        if (input_names.indexOf($(this).attr('name')) == -1 &&
            ['image', 'submit'].indexOf($(this).attr('type')) == -1) {
            input_names.push($(this).attr('name'));
        }
    });
    return input_names
}


function saveTOCookie() {
    var input_datas = {}, parent_dev = "";
    if ($('#search-form .sp_dp_n').length >= 1 || $('#search-form .pc_dp_n').length >= 1) {
        parent_dev = $('#search-form .sp_dp_n').eq(1).is(':hidden') ? '#search-form .pc_dp_n' : '#search-form .sp_dp_n';
    }
    $.each(getAllSearchFields(), function(_, name) {
        var input_tag = $(parent_dev + " input[name='" + name + "']"), work = [];
        if (input_tag.length == 0) {
            parent_dev = '#search-form';
            input_tag = $(parent_dev + " input[name='" + name + "']")
        }

        if (input_tag.attr('type') == 'radio') {
            if ($(parent_dev + " input[name='" + name + "']:checked").val() != void 0) {
                work.push($(parent_dev + " input[name='" + name + "']:checked").val());
            }
        } else if (input_tag.attr('type') == 'checkbox') {
            $(parent_dev + " input[name='" + name + "']:checked").each(function() {
                if ($(this).val() != void 0) {
                    work.push($(this).val());
                }
            });
        } else if (input_tag.attr('type') == 'text') {
            if (input_tag.val() != void 0 && input_tag.val() != "") {
                work.push(input_tag.val());
            } else if ($("input[name='query2']").val() != void 0 && $("input[name='query2']").val() != "") {
                // headerのキーワード検索
                work.push($("input[name='query2']").val());
            }
        }
        input_datas[input_tag.attr('name')] = {'values': work, 'input_type': input_tag.attr('type')};
    });
    $.cookie('search_fields', JSON.stringify(input_datas));
}


function splitLine(v, delim, quote) {
    var delim = typeof delim == "string" ? new RegExp( "[" + (delim || ","   ) + "]" ) : typeof delim == "undefined" ? "," : delim,
        quote = typeof quote == "string" ? new RegExp("^[" + (quote || '"'   ) + "]" ) : typeof quote == "undefined" ? '"' : quote;
    var arr  = v.split(delim),　out = [], q;

    for (var i=0, l=arr.length; i<l; i++) {
        if (q = arr[i].match(quote)) {
            for (j=i; j<l; j++) {
                if (arr[j].charAt(arr[j].length-1) == q[0]) { break; }
            }
            var s = arr.slice(i,j+1).join(delim);
            out.push(s.substr(1,s.length-2));
                    i = j;
        }　else { out.push(arr[i]); }
    }
    return out;
}


var filter = {
    init: function() {
        var self = this;
        self.cookie_name = 'search_fields'
        self.csv_file = 'data.csv';
        self.delimiter = "･";
        self.search_conditions = {};
        self.rows = self._loadCsv();
    },

    _loadCsv: function() {
        var self = this, header = [], rows = [], lines = [];
        var data = new XMLHttpRequest();
        data.open("GET", self.csv_file, false);
        data.send(null);
        var data = data.responseText;
        $.each([String.fromCharCode(13) + String.fromCharCode(10), String.fromCharCode(13), String.fromCharCode(10)], function(i, delimiter) {
            lines = data.split(delimiter);
            if (lines.length > 1) return false
        });

        $.each(lines, function(line_i, line) {
            var row = splitLine(line);
            if (line_i == 0) {
                header = row;
            } else {
                var cols = {}
                if (header.length >= 1) {
                    $.each(header, function(i, k){
                        cols[k] = row[i].replace(/"/img, '');
                    });
                    rows.push(cols);
                }
            }
        });
        return rows
    },

    getSearchConditions: function() {
        var self = this;
        self.search_conditions = {};
        if ($.cookie(self.cookie_name)) {
            self.search_conditions = JSON.parse($.cookie(self.cookie_name));
            self._removeCookie();
        }
        return self.search_conditions
    },

    _removeCookie: function() {
        var self = this;
        $.removeCookie(self.cookie_name);
    },

    search: function(row, search_conditions, delimiter) {
        var self = this;
        var search_flag = true;
        $.each(search_conditions, function(k, cond_obj) {
            if (cond_obj['values'].length == 0) return true

            for (var i = 0; i < cond_obj['values'].length; i++) {
                var col_array = row[k].split(delimiter);
                if (cond_obj['input_type'] == 'text') {
                    if (!row[k].match(new RegExp(cond_obj['values'][i], "g"))) {
                        search_flag = false;
                    }
                } else {
                    if (col_array.indexOf(cond_obj['values'][i]) == -1) {
                        search_flag = false;
                    } else {
                        search_flag = true;
                    }
                }
                if (cond_obj['input_type'] == 'checkbox' && search_flag === true) {
                    break;
                }
            }
            if (search_flag === false) return false;
        });
        return search_flag
    },
};


var render = {
    renderItems: function(render_parent_id, render_count_class, searchObj, rows, search_conditions, delimiter, row_html, row_html_none) {
        var self = this, parent = $('#' + render_parent_id), count = 0;
        parent.empty();
        $.each(rows, function(_, row_data) {
            if (!searchObj(row_data, search_conditions, delimiter)) return true
            count++;
            var tr = row_html;
            $.each(row_data, function(key, value) {
                tr = tr.replace(new RegExp('## ' + key + ' ##',"g"), value);
            });
            parent.append(tr);
        });

        // 件数
        $.each($('.' + render_count_class), function(_, count_tag) {
            $(count_tag).empty().append(count);
        });
        if(count == 0) {
            parent.append(row_html_none);
        }
    },

    setSearchFormValue: function(search_conditions) {
        var parent_dev = "";
        if ($('#search-form .sp_dp_n').length >= 1 || $('#search-form .pc_dp_n').length >= 1) {
            parent_dev = $('#search-form .sp_dp_n').eq(1).is(':hidden') ? '#search-form .pc_dp_n' : '#search-form .sp_dp_n';
        }
        $.each(search_conditions, function(key, values) {
            if ($(parent_dev + " input[name='" + key + "']").length == 0) parent_dev = "#search-form";
            if (values['input_type'] == 'checkbox') {
                $(parent_dev + " input[name='" + key + "']").each(function() {
                    if (values['values'].indexOf($(this).val()) != -1) {
                        $(this).prop("checked", true);
                    }
                });
            } else {
                $(parent_dev + " input[name='" + key + "']").val(values['values']);
            }
        });
    },

    renderSearchConditionsField: function(search_conditions, delimiter) {
        var text = null;
        $.each(search_conditions, function(key, values) {
            $('#condition-' + key).empty();
            if (values['values'] != void 0) {
                if (values['input_type'] == 'checkbox') {
                    text = values['values'].join(delimiter);
                } else {
                    text = values['values'];
                }
                $('#condition-' + key).append(text);
            }
        });
    },
};


$.extend({
    indexHTMLEventInit: function() {
        $("#exec").click(function() {
            saveTOCookie();
            location.href="search.html";
        });
    },
    searchHTMLEventInit:  function() {
        filter.init();
        custom_render.render();
        $('#sort').tablesorter();

        $("#exec").click(function(e) {
            saveTOCookie();
            custom_render.render();

            if ($('.headerSortDown').length >= 1) {
                $.each($('.headerSortDown'), function() {
                    $(this).removeClass('headerSortDown');
                });
            }
            if ($('.headerSortUp').length >= 1) {
                $.each($('.headerSortUp'), function() {
                    $(this).removeClass('headerSortUp');
                });
            }
            $('#sort th').unbind();
            $('#sort').tablesorter();
            $("html,body").animate({scrollTop:$('#sort').offset().top});
            return false
        });
    },
});
