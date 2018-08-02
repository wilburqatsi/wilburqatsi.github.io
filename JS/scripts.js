// Smoothly scroll to projects section upon clicking on arrow

$(".arrow").click(function(){
	$("html, body").animate({
		scrollTop: $("#projects").offset().top
	}, 1000);
	return false;
});