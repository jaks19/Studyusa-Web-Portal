// For search bar
// ( Need input bar id='search-bar' and table to be pruned has id='searchable-table' )
// tds that contain terms to search against have id='the relevant term to search against e.g. group name'

$('#search-bar').keyup(function () {
  let input, filter, table, tr, td, i;

  input = $(this)[0];
  filter = input.value.toUpperCase();
  table = $("#searchable-table");
  tbody = table[0].getElementsByTagName("tbody");
  trs = tbody[0].getElementsByTagName("tr");

  for (i = 0; i < trs.length; i++) {
    tds = trs[i].getElementsByTagName("td");

    for (j = 0; j < tds.length; j++) {

      if (tds[j].id.toUpperCase().indexOf(filter) > -1) {
          trs[i].style.display = "";
          break;
      } else {
          trs[i].style.display = "none";
      }

    }
  }
});
