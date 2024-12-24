
var custom_render = {
    render: function() {
        var self = this, rows = filter.rows, search_conditions = filter.getSearchConditions()
            delimiter = filter.delimiter;
        render.renderItems('render-row', 'number-filed', filter.search, rows, search_conditions, delimiter, self._row_html(), self._row_html_none());
        render.setSearchFormValue(filter.search_conditions);
        render.renderSearchConditionsField(filter.search_conditions, '、');
    },

    _row_html: function() {
        return (function() {/*
              <tr class=" ">
                <td class="view">
                  <div class="inner">
                    <a href="## url ##" target="_blank" >
                      <img class="itemImg" src="img/thum/## image ##" width="100" height="100">
                      <span class="itemName">## name ##</span>
                    </a>
                  </div>
                </td>
                <td><span hidden>## price_sort ##</span>## price_str ##</td>
                <td><span hidden>## price2_sort ##</span>## price2_str ##</td>
                <td>## regular_course ##</td>
                <td>## capacity ##</td>
                <td>## factory ##</td>
                <td>
                  <a href="## url ##" target="_blank" >
                    <img class="imgRo fade" src="img/detail_btn.png" alt="詳細はこちら">
                  </a>
                </td>
              </tr>
*/}).toString().split('*')[1]
    }
,
    _row_html_none: function() {
        return (function() {/*
  <tr class="">
    <td class="view" colspan="7">
    絞り込み条件に合う商品はありませんでした。
    </td>
  </tr>
*/}).toString().split('*')[1]
    }
}

var nil = function(){};

$(function() {
    $.searchHTMLEventInit();
});