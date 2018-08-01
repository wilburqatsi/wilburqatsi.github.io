//var projects = document.getElementById("projects");
//var arrow = document.getElementById("arrow");
//
//arrow.addEventListener("click", function(){
//	projects.scrollIntoView({
//		behavior: "auto"
//	});
//});


$("#arrow").click(function(){
	$("html, body").animate({
		scrollTop: $("#projects").offset().top
	}, 1000);
	return false;
});