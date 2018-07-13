// source
(function() {
	const songsToText = (
		allsongs,
		style = "all",
		csv = true,
		likedonly = false
	) => {
		let outText = "";
		outText = "";
		if (csv) {
			if (style == "all") {
				//extra line
				outText =
					"artist,album,title,duration,playcount,rating,rating_interpretation" +
					"\n";
			}
		}
		var numEntries = 0;
		var seen = {};
		for (var i = 0; i < allsongs.length; i++) {
			var curr = "";
			var properTitle = allsongs[i].title.replace(/[\n\r!]/g, "").trim();
			if (!likedonly || (likedonly && allsongs[i].rating >= 5)) {
				if (csv) {
					if (style == "all") {
						//extra line
						curr +=
							'"' +
							allsongs[i].artist.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' +
							allsongs[i].album.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' +
							properTitle.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' +
							allsongs[i].duration.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' +
							allsongs[i].playcount.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' +
							allsongs[i].rating.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' +
							allsongs[i].rating_interpretation
								.replace(/"/g, '""')
								.trim() +
							'"';
					} else if (style == "artist") {
						curr +=
							'"' +
							allsongs[i].artist.replace(/"/g, '""').trim() +
							'"';
					} else if (style == "artistsong") {
						curr +=
							'"' +
							allsongs[i].artist.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' + properTitle.replace(/"/g, '""').trim() + '"';
					} else if (style == "artistalbum") {
						curr +=
							'"' +
							allsongs[i].artist.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' +
							allsongs[i].album.replace(/"/g, '""').trim() +
							'"';
					} else if (style == "artistalbumsong") {
						curr +=
							'"' +
							allsongs[i].artist.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' +
							allsongs[i].album.replace(/"/g, '""').trim() +
							'"' +
							",";
						curr +=
							'"' + properTitle.replace(/"/g, '""').trim() + '"';
					} else {
						console.log("style not defined");
					}
				} else {
					if (style == "all") {
						curr =
							allsongs[i].artist +
							" - " +
							allsongs[i].album +
							" - " +
							properTitle +
							" [[playcount: " +
							allsongs[i].playcount +
							", rating: " +
							allsongs[i].rating_interpretation +
							"]]";
					} else if (style == "artist") {
						curr = allsongs[i].artist;
					} else if (style == "artistalbum") {
						curr = allsongs[i].artist + " - " + allsongs[i].album;
					} else if (style == "artistsong") {
						curr = allsongs[i].artist + " - " + properTitle;
					} else if (style == "artistalbumsong") {
						curr =
							allsongs[i].artist +
							" - " +
							allsongs[i].album +
							" - " +
							properTitle;
					} else {
						console.log("style not defined");
					}
				}
				if (!seen.hasOwnProperty(curr)) {
					// hashset
					outText = outText + curr + "\n";
					numEntries++;
					seen[curr] = true;
				} else {
					//console.log("Skipping (duplicate) " + curr);
				}
			}
		}
		return outText;
	};

	const download = text => {
		var filename = "playlist.csv";
		if (window.document.title) {
			filename = window.document.title.split("-")[0] + " playlist.csv";
		}
		console.log(text);
		console.log(typeof text);
		var url = window.URL.createObjectURL(
			new Blob([text], { type: "text/csv" })
		);

		var a = document.createElement("a");
		document.body.appendChild(a);
		a.setAttribute("class", "download-file");
		a.setAttribute("download", filename + ".csv");
		a.setAttribute("href", url);
		a.style["display"] = "none";
		a.click();
		setTimeout(() => {
			window.URL.revokeObjectURL(url);
		}, 10);
	};

	const scrapeSongs = () =>
		new Promise((resolve, reject) => {
			var allsongs = [];
			var intervalms = 1; //in ms
			var timeoutms = 3000; //in ms
			var retries = timeoutms / intervalms;
			var total = [];
			var seen = {};
			var topId = "";
			document.querySelector("#mainContainer").scrollTop = 0; //scroll to top
			var interval = setInterval(() => {
				var songs = document.querySelectorAll(
					"table.song-table tbody tr.song-row"
				);
				if (songs.length > 0) {
					// detect order
					var colNames = {
						index: -1,
						title: -1,
						duration: -1,
						artist: -1,
						album: -1,
						playcount: -1,
						rating: -1
					};
					for (var i = 0; i < songs[0].childNodes.length; i++) {
						colNames.index =
							songs[0].childNodes[i].getAttribute("data-col") ==
							"index"
								? i
								: colNames.index;
						colNames.title =
							songs[0].childNodes[i].getAttribute("data-col") ==
							"title"
								? i
								: colNames.title;
						colNames.duration =
							songs[0].childNodes[i].getAttribute("data-col") ==
							"duration"
								? i
								: colNames.duration;
						colNames.artist =
							songs[0].childNodes[i].getAttribute("data-col") ==
							"artist"
								? i
								: colNames.artist;
						colNames.album =
							songs[0].childNodes[i].getAttribute("data-col") ==
							"album"
								? i
								: colNames.album;
						colNames.playcount =
							songs[0].childNodes[i].getAttribute("data-col") ==
							"play-count"
								? i
								: colNames.playcount;
						colNames.rating =
							songs[0].childNodes[i].getAttribute("data-col") ==
							"rating"
								? i
								: colNames.rating;
					}
					// check if page has updated/scrolled
					var currId = songs[0].getAttribute("data-id");
					if (currId == topId) {
						// page has not yet changed
						retries--;
						scrollDiv = document.querySelector("#mainContainer");
						isAtBottom =
							scrollDiv.scrollTop ==
							scrollDiv.scrollHeight - scrollDiv.offsetHeight;
						if (isAtBottom || retries <= 0) {
							clearInterval(interval); //done
							allsongs = total;
							resolve(allsongs);
						}
					} else {
						retries = timeoutms / intervalms;
						topId = currId;
						// read page
						for (var i = 0; i < songs.length; i++) {
							var curr = {
								dataid: songs[i].getAttribute("data-id"),
								index:
									colNames.index != -1
										? songs[i].childNodes[colNames.index]
												.textContent
										: "",
								title:
									colNames.title != -1
										? songs[i].childNodes[colNames.title]
												.textContent
										: "",
								duration:
									colNames.duration != -1
										? songs[i].childNodes[colNames.duration]
												.textContent
										: "",
								artist:
									colNames.artist != -1
										? songs[i].childNodes[colNames.artist]
												.textContent
										: "",
								album:
									colNames.album != -1
										? songs[i].childNodes[colNames.album]
												.textContent
										: "",
								playcount:
									colNames.playcount != -1
										? songs[i].childNodes[
												colNames.playcount
										  ].textContent
										: "",
								rating:
									colNames.rating != -1
										? songs[i].childNodes[
												colNames.rating
										  ].getAttribute("data-rating")
										: "",
								rating_interpretation: ""
							};
							if (curr.rating == "undefined") {
								curr.rating_interpretation = "never-rated";
							}
							if (curr.rating == "0") {
								curr.rating_interpretation = "not-rated";
							}
							if (curr.rating == "1") {
								curr.rating_interpretation = "thumbs-down";
							}
							if (curr.rating == "5") {
								curr.rating_interpretation = "thumbs-up";
							}
							if (!seen.hasOwnProperty(curr.dataid)) {
								// hashset
								total.push(curr);
								seen[curr.dataid] = true;
							}
						}
						songs[songs.length - 1].scrollIntoView(true); // go to next page
					}
				}
			}, intervalms);
		});
	scrapeSongs().then(allsongs => {
		let txt = songsToText(allsongs, "all", true);
		download(txt);
	});
	// for the full CSV version you can now call songsToText("all", true);
})();
