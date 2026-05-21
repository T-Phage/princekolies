declare var $: any;
declare var jQuery: any;

if ($ && $.fn && $.fn.dataTable) {
  ($.fn.dataTable as any).ext.errMode = 'none';
}