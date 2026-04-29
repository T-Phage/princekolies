import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatabaleService {

  constructor(
    private zone: NgZone,
  ) { }

  initiateDataTable(tableClassName:string, pageLen:number) {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        const preloader = document.getElementById('global-loader') as HTMLDivElement;
        if (preloader) {
          preloader.style.display = 'none';
        }
        // if ($('.datanew').length > 0){
          $(tableClassName).DataTable({
            "pageLength": pageLen,
            // "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            "bFilter": true,
            "sDom": 'fBtlpi',
            // "dom": 'pftil',
            "ordering": true,
            "language": {
              emptyTable: "No data available in table",
              infoEmpty: "",
              search: ' ',
              sLengthMenu: '_MENU_',
              searchPlaceholder: "Search",
              info: "_START_ - _END_ of _TOTAL_ items",
              paginate: {
                next: ' <i class=" fa fa-angle-right"></i>',
                previous: '<i class="fa fa-angle-left"></i> '
              },
            },
            initComplete: (_settings: any, _json: any) => {
              $('.dataTables_filter').appendTo('#tableSearch');
              $('.dataTables_filter').appendTo('.search-input');
            },
          }); 
          // $('.datanew-2').DataTable({
          //   "bFilter": true,
          //   // "sDom": 'fBtlpi',
          //   "dom": 'pftil',
          //   "ordering": true,
          //   "language": {
          //     emptyTable: "",
          //     infoEmpty: "",
          //     search: ' ',
          //     sLengthMenu: '_MENU_',
          //     searchPlaceholder: "Search",
          //     info: "_START_ - _END_ of _TOTAL_ items",
          //     paginate: {
          //       next: ' <i class=" fa fa-angle-right"></i>',
          //       previous: '<i class="fa fa-angle-left"></i> '
          //     },
          //   },
          //   initComplete: (_settings: any, _json: any) => {
          //     $('.dataTables_filter').appendTo('#tableSearch');
          //     $('.dataTables_filter').appendTo('.search-input');
          //   },
          // });  // Initialize jQuery DataTable outside Angular’s zone

        // }
      }, 1000)
    }
    );
  }
}
