(function($){
$.fn.ytVideos = function(settings) {
	return this.each(function() {
	
		$ytVideos = $(this);
		/*
			valid settings are:
			user 	: YouTube User Account
			count 	: how many thumbsnails to show.  enter 1 to show none, just the video.  Use the query parameter to specify the video ID.
			query	: Query/Search term.  If you provide a keyword in quotes or the video ID the restuls should be appropriate.
			tooltips: Show tooltips on the thumbnails (requires jquery tools tooltip plugin)
			rowSize	: Adds a "last" class to the last thumbnail.
		*/
	
	    settings = $.extend( {
	      'rowSize' : 0,
	      'tooltips': false,
	      'user':''
	    }, settings);
	    
	    var query = $ytVideos.text().replace(/youtube (id|keyword):/i,"");
	    
		var ytFeed = "?v=2&alt=jsonc&callback=?";
		
		if (settings.user.length > 0) {
			ytFeed = "http://gdata.youtube.com/feeds/api/users/" + settings.user + "/uploads" + ytFeed;
		} else {
			ytFeed = "http://gdata.youtube.com/feeds/api/videos" + ytFeed
		}

		if (query.length > 0) ytFeed += '&q="' + query + '"';
		if (settings.count > 0) ytFeed += "&max-results=" + settings.count;
	
		console.log(ytFeed);
	
		ytDone = false;
		
		$ytVideos.empty();
			
		$.getJSON(ytFeed,function(json) {
			if (json.data.totalItems > 0) {
				$ytVideos.append('<div class="ytPlayer"><div id="player" /></div>');
	
				if (json.data.itemsPerPage > 1) {
					$ytVideos.append('<div class="ytThumbs" />');			
					var $ytThumbs = $ytVideos.find("div.ytThumbs");
				}
				
				$.each(json.data.items, function (i, item) {
					if (i == 0 ) {
						onYouTubePlayerAPIReady = function() {	
							player = new YT.Player('player', {
								height:			'100%',
								width:			'100%',
								videoId: 		item.id,
								playerVars: {
									'autohide':1,
									'rel': 0 ,
									'modestbranding':1
								}, 
								events: {
									'onStateChange': function(event) {
										if (event.data == YT.PlayerState.PLAYING && !ytDone) {
											_gat._getTrackerByName()._trackEvent('Media', 'YouTube Video',item["player"]["default"]);
											ytDone = true;
										}
									}
								}
							});
						}
						
						var tag = document.createElement('script');
						tag.src = "http://www.youtube.com/player_api";
						var firstScriptTag = document.getElementsByTagName('script')[0];
						firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
						
						currentVid = item.id;
					}
					
					var thumbTitle = item.title.replace(/team oil tools \- /i, "");
	
					if (json.data.itemsPerPage > 1) {
						$ytThumbs.append(
							'<div class="ytThumb">' +
							'<a class="ytLink" href="' + item["player"]["default"] + '" target="_blank" rel="' + item["id"] + '" >' +
							'<img src="' + item.thumbnail.sqDefault + '" alt="' + thumbTitle + '" title="' + thumbTitle + '" />' + 
							'<div class="ytTitle">' + thumbTitle + '</div>' +
							'</a></div>'
						);
								
						$ytThumbs.find("a.ytLink").click(function(event) {
								event.preventDefault();
							var vidID = $(this).attr("rel");
							if (vidID !== currentVid){
								currentVid = vidID;
								ytDone = true;
								player.loadVideoById(vidID);
								_gat._getTrackerByName()._trackEvent('Media', 'YouTube Video', $(this).attr("href"));
							} else {
								player.playVideo();
							}
						});			
					}					
				});
	
				$ytVideos.append('<div class="clear"></div>');
			
				if (settings.tooltips == (true | 1)) {
					setTimeout(function(){
						$ytVideos.find("div.ytThumbs div.ytThumb img").tooltip({
							effect: 'slide',
							position: 'center right',
							offset: [0,10],
							opacity: .9,
							predelay: 200
						});
					},500);
				}
				
				if (settings.rowSize != 0) {
					setTimeout(function(){
						$ytVideos.find("div.ytThumbs div.ytThumb:nth-child("+settings.rowSize+"n)").addClass("last")
					},500);
				}
			}
		});
	});
};
})(jQuery);