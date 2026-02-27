function dt(){
    if($('.datanew').length > 0) {
        $('.datanew').DataTable({
            "bFilter": true,
            "sDom": 'fBtlpi',  
            "ordering": true,
            pageLength: 10, 
            "language": {
                search: ' ',
                sLengthMenu: '_MENU_',
                searchPlaceholder: "Search",
                info: "_START_ - _END_ of _TOTAL_ items",
                paginate: {
                    next: ' <i class=" fa fa-angle-right"></i>',
                    previous: '<i class="fa fa-angle-left"></i> '
                },
             },
            initComplete: (settings, json)=>{
                $('.dataTables_filter').appendTo('#tableSearch');
                $('.dataTables_filter').appendTo('.search-input');

            },	
        });
    }
} 