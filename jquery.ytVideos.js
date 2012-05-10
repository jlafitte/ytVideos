(function($){
$.fn.ytVideos = function(settings) {
	return this.each(function(index) {	
		var ytPlayer = ytPlayer;
		var $ytVideos = $(this);
		/*
			valid settings are:
			embed 	: boolean - will show an embedded player
			user 	: string - YouTube User Account
			count 	: positive integer - how many thumbsnails to show.  enter 1 to show none, just the video.  Use the query parameter to specify the video ID.
			query	: string - Query/Search term.  If you provide a keyword in quotes or the video ID the restuls should be appropriate.
			tooltips: boolean - Show tooltips on the thumbnails (requires jquery tools tooltip plugin)
			ga 		: boolean - create a google analytics tracking event
			rowSize	: positive integer - Adds a "last" class to the last thumbnail.
			lightbox: boolean - will put the video in a lightbox and automatically change the embed to true no matter what you set.
			olclass : string - Additional classname to apply to the overlay div.
		*/
	
	    settings = $.extend( {
	      'embed'   : true,
	      'rowSize' : 0,
	      'user'	:'',
	      'playlist':'',
	      'count'	: 50
	    }, settings);
	    
		var query = $ytVideos.text();
		var ytFeed = "?v=2&alt=jsonc";
		
		// Define some settings if they are in the div
		if ((/youtube user:/i).test(query)) {
			settings = $.extend(settings,{'user':query.replace(/youtube user:/i,"")});
			query = "";
		}
		
		if ((/youtube playlist:/i).test(query)) {
			settings = $.extend(settings,{'playlist':query.replace(/youtube playlist:/i,"")});
			query = "";
		}
		
		if (settings.lightbox == (true || 1 || "yes")) {
			settings = $.extend(settings,{'embed':true});
		}
		
		if (settings.playlist.length > 0) {
		   ytFeed = "http://gdata.youtube.com/feeds/api/playlists/" + settings.playlist + ytFeed;
		} else if (settings.user.length > 0) {
			ytFeed = "http://gdata.youtube.com/feeds/api/users/" + settings.user + "/uploads" + ytFeed;
		} else {
			ytFeed = "http://gdata.youtube.com/feeds/api/videos" + ytFeed
		}

		query = query.replace(/youtube (id|video|keyword|gallery):/i,"");
		
		if (query != null && query.length > 0) ytFeed += '&q=' + query;
		if (settings.count > 0) ytFeed += "&max-results=" + settings.count;
		
		ytFeed += "&callback=?";
	
		ytDone = false;
		
		$ytVideos.empty();
					
		$.getJSON(ytFeed,function(json) {
		
			if (json.data.itemsPerPage > 1 && settings.count > 1) {
				$ytVideos.append('<div class="ytThumbs" />');			
				var $ytThumbs = $ytVideos.find("div.ytThumbs");
			}

			if (json.data.totalItems > 0) {
				$.each(json.data.items, function (i, item) {
					if (item.video != undefined) {
						var ytid = item.video.id,yttitle = item.video.title,yturl=item["video"]["player"]["default"],ytthumb=item.video.thumbnail.sqDefault;
					} else {
						var ytid = item.id,yttitle = item.title,yturl=item["player"]["default"],ytthumb=item.thumbnail.sqDefault;
					}
					
					if (i == 0 && settings.embed ) {
						$ytVideos.prepend('<div class="ytPlayer ' + settings.olclass + '" id="ytPlayer"><div id="ytPlayerInternal" /></div>');

						var tag = document.createElement('script');
						tag.src = "http://www.youtube.com/player_api";
						var firstScriptTag = document.getElementsByTagName('script')[0];
						firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
						
						onYouTubePlayerAPIReady = function(){							
							ytPlayer = new YT.Player("ytPlayerInternal", {
								height:			'100%',
								width:			'100%',
								videoId: 		ytid,
								playerVars: {
									'autohide':3,
									'controls':1,
									'rel': 0 ,
									'modestbranding':1,
									'showinfo':1
								}, 
								events: {
									'onStateChange': function(event) {
										if (event.data == YT.PlayerState.PLAYING && !ytDone) {
											if (settings.ga) {
												_gat._getTrackerByName()._trackEvent('Media', 'YouTube Video',yturl);
											}
											ytDone = true;
										}
									}
								}
							});
						}
					}
					
					var thumbTitle = yttitle;
	
					if (json.data.itemsPerPage > 1) {
						$ytThumbs.append(
							'<div class="ytThumb">' +
							'<a class="ytLink" href="' + yturl + '" target="_blank" data-video="' + ytid + '" rel="#ytPlayer">' +
							'<img src="' + ytthumb + '" alt="' + thumbTitle + '" title="' + thumbTitle + '" />' + 
							'<div class="ytTitle">' + thumbTitle + '</div>' +
							'</a></div>'
						);	
					}					
				});
	
				$ytVideos.append('<div style="clear:both"></div>');
			
				if (settings.tooltips == (true || 1)) {
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
				
				$ytVideos.find("a.ytLink").click(function(event) {
					if (settings.embed == (true || 1)) {
						event.preventDefault();
						var $trigger = $(this);
						var ytid = $trigger.attr("data-video");
						var yturl = $trigger.attr("href");

						$("#ytPlayerInternal").replaceWith('<div id="ytPlayerInternal" /></div>');
						
						delete ytPlayer;

						ytDone = false;

						ytPlayer = new YT.Player("ytPlayerInternal", {
							height:			'100%',
							width:			'100%',
							videoId: 		ytid,
							playerVars: {
								'autoplay':1,
								'autohide':3,
								'controls':1,
								'rel': 0 ,
								'modestbranding':1,
								'showinfo':1
							}, 
							events: {
								'onStateChange': function(event) {
									if (event.data == YT.PlayerState.PLAYING && !ytDone) {
										if (settings.ga) {
											_gat._getTrackerByName()._trackEvent('Media', 'YouTube Video',yturl);
										}
										ytDone = true;
									}
								}
							}
						});
						
						if (settings.lightbox == (true || 1)) {
							$trigger.overlay({
								expose: { 
									color: '#000',
									loadSpeed: 200,
									opacity: 0.7,
									onClose: function() {
										ytPlayer.destroy();
									}
								},load:true
							}).load();
						}
					} else if (settings.ga && !ytDone) {
						_gat._getTrackerByName()._trackEvent('Media', 'YouTube Video', $(this).attr("href"));
						ytDone = true;
					}
				});		
			}
		});
	});
};
})(jQuery);