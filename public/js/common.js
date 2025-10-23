function ERROR($state,err){
	console.log(err);
	if(err.status==401){
		$state.go('login');
		toastr.error("로그인 해주세요.");
	}else{
		//console.log(err);
		console.log(err);
		toastr.error('에러입니다.');
	}
}

function fromJson(list,fields){
	for (var i = 0; i < list.length; i++) { 
	    var item = list[i];
	    for(var j=0; j<fields.length; j++){
	    	var key =fields[j];
	    	if(item[key]){
	    		item[key]= angular.fromJson(item[key]);
	    	}
	    }
	}
	return list;
}
function zoomImage (){
     $('.image-popup-no-margins').magnificPopup({
			type: 'image',
			closeOnContentClick: true,
			closeBtnInside: false,
			fixedContentPos: true,
			mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
			image: {
				verticalFit: true
			},
			zoom: {
				enabled: true,
				duration: 300 // don't foget to change the duration also in CSS
			}
	});

}