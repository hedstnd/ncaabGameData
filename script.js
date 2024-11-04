var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var day;// = dayOfWeek[(new Date()).getDay()].toLowerCase();
var timeOffset = (new Date()).getTimezoneOffset() / 60;
var twos = ["home","away"];
const baseURL = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/";
const baseU2 = "https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/";
var vars;
var uRL;
var hideCode = "";
var d = new Date();
d.setHours(d.getHours() - timeOffset);
var r = document.querySelector(':root');
window.onload = function() {
	getData(baseURL + "scoreboard?groups=50&dates="+ d.toISOString().substring(0,10).replaceAll("-","")).then((value) => {
		getData(baseU2 + "scoreboard?groups=50&dates="+ d.toISOString().substring(0,10).replaceAll("-","")).then((val2) => {
		console.log(value);
		console.log(val2);
		if (value.events.length > 0) {
			g3 = value.events.filter(e => e.status.type.state == "in");
		} else {
			g3 = [];
		}
		if (val2.events.length > 0) {
			g2 = val2.events.filter(e => e.status.type.state == "in");
		} else {
			g2 = [];
		}
		g = g3.concat(g2);
		tab = document.createElement("table");
		for (var i = 0; i < g.length/4; i++) {
			row = document.createElement("tr");
			for (var j = i * 4; j < i*4+4 && j < g.length; j++) {
				if (/*g[j].teams.away.score!=null && g[j].teams.home.score!=null*/true) {
					game = document.createElement("td");
					if (g[j].status.type.state != "in") {
						if (g2.includes(g[j])) {
							game.innerHTML = "(WBB) ";
						}
						game.innerHTML += g[j].name + "<br/>" + getGameTime(g[j].date);
					} else {
						if (g2.includes(g[j])) {
							game.innerHTML = "(WBB) ";
						}
						game.innerHTML += g[j].name +"<br/>"+g[j].status.type.shortDetail;
						// if (g[j].status.statusCode != g[j].status.codedGameState) {
							// game.innerHTML+= " ("+g[j].status.detailedState+")";
						// }
					}
					if (g[j].status.type.state == "") {
						game.setAttribute("onclick","runGD(\""+baseURL+g[j].link+"\",\""+ g[j].description +"\")");
					} else {
						if (g2.includes(g[j])) {
							game.setAttribute("onclick","runGD(\""+baseU2+"summary?event="+g[j].id+"\")");
						} else {
							game.setAttribute("onclick","runGD(\""+baseURL+"summary?event="+g[j].id+"\")");
						}
					}
					row.appendChild(game);
				}  else if (g[j].status.statusCode != g[j].status.codedGameState) {
					game = document.createElement("td");
					game.innerHTML = g[j].teams.away.team.name + " @ " + g[j].teams.home.team.name + "<br/>" + g[j].status.detailedState + " - " + g[j].status.reason;
					row.appendChild(game);
				} else if (g[j].status.statusCode == "P") {
					game = document.createElement("td");
					game.innerHTML = g[j].teams.away.team.name + " @ " + g[j].teams.home.team.name + "<br/>First Pitch: " + getGameTime(g[j].gameDate);
					if (g[j].linescore.offense.battingOrder && g[j].linescore.defense.battingOrder) {
						if (g[j].gamedayType == "P") {
							game.setAttribute("onclick","runGD(\""+baseURL+g[j].link+"\",\""+ g[j].description +"\")");
						} else {
								game.setAttribute("onclick","runGD(\""+baseURL+g[j].link+"\")");
							}
					}
					row.appendChild(game);
				}
			}
			tab.appendChild(row);
		}
		// document.getElementById("scores").innerHTML = "";
		document.getElementById("scores").appendChild(tab);
		if (g.length == 0) {
			document.getElementById("scores").innerHTML += "<table><td>No active games</td></table>";
		}
	});});
}
function gameDay() {
	url = uRL;
	console.log(url);
	getData(url).then((value) => {
		console.log(value);
		// if (value.liveData.plays.currentPlay.about.isTopInning) {
			pitchDisplay(value);
		// } else {
			// pitchDisplay(value);
		// }
	});
	
}
function runGD(url, desc="") {
	document.getElementById("sett").className +=" gameOn";
	uRL = url;
	gameDay();
	if (desc.length > 0) {
		var splText = splitInHalf(desc);
		document.getElementById("awayDesc").innerHTML = splText[0];
		// document.getElementById("awayDesc").after(document.createElement("br"));
		document.getElementById("homeDesc").innerHTML = splText[1];
		// document.getElementById("homeDesc").after(document.createElement("br"));
	}
	run = setInterval(gameDay,5000);
}
async function pitchDisplay(game) {
	var lastPlay;
	try {
		lastPlay = game.plays.pop();
	} catch (err) {
		lastPlay = new Object();
	}
	var popUp = document.getElementById("popText");
	await timeout(document.getElementById("offset").value * 1000);
	document.getElementsByClassName("showSett")[0].style = "";
	var wp = new Object();
	try {
		wp.home = Math.round(game.winprobability.filter(e => e.playId == lastPlay.id)[0].homeWinPercentage * 1000)/10;
	} catch (err) {
		wp.home = game.predictor.homeTeam.gameProjection;
	}
	wp.away = Math.round((100-wp.home)*10)/10;
	for (var i = 0; i < 2; i++) {
		var tm = game.header.competitions[0].competitors[i];
		var wProbText = tm.team.abbreviation +  " Win&nbsp;Probability:&nbsp;";
		wProbText += wp[tm.homeAway]+"%";
		document.getElementById(tm.homeAway+"WPSpan").style.width = wp[tm.homeAway] + "%";
		
		// document.getElementById(tm.homeAway+"WP").innerText = "";
		// document.getElementById(tm.homeAway+"WPSpan").innerText = "";
			// document.getElementById(tm.homeAway+"WPImg").src="";
			wP = document.getElementById(tm.homeAway+"WP");//createElement("span");
			// wP.className = 'winProb';
			wP.innerHTML = wProbText;
			if (game.header.competitions[0].tournamentId && tm.rank) {
				document.getElementById(tm.homeAway+"Name").innerHTML = "(" + tm.rank + ") " + tm.team.nickname;
			} else {
				document.getElementById(tm.homeAway+"Name").innerHTML = tm.team.nickname;
			}
			document.getElementById(tm.homeAway+"Score").innerHTML = lastPlay[tm.homeAway+"Score"] || (tm.score || "");
			// top.before(wP);
			// document.getElementById(tm.homeAway+"WPSpan").value=valCM.awayWinProbability;
		if (wp[tm.homeAway] <= 2) {
			// document.getElementById(tm.homeAway+"WPSpan").innerHTML = wProbText;
			document.getElementById(tm.homeAway+"WPImg").style.opacity = "0";
			document.getElementById(tm.homeAway+"WPImg").style.width = "0";
		} else {
			document.getElementById(tm.homeAway+"WPImg").style.opacity = "1";
			document.getElementById(tm.homeAway+"WPImg").style.width = "3dvh";
		}
	// if (game.gameData.status.statusCode != "I" && game.gameData.status.statusCode != "PW" && game.gameData.status.statusCode != hideCode) {
		// popUp.parentElement.style.display = "block";
		// popUp.innerText = game.gameData.status.detailedState;
		// if (game.gameData.status.statusCode == "P") {
			// popUp.innerHTML += "<br/>First Pitch: " + getGameTime(game.gameData.datetime.dateTime);
		// }
		// document.getElementById("close").setAttribute("onclick","hideModal(\""+game.gameData.status.statusCode+"\")");
	// } else {
		// popUp.parentElement.style.display = "none";
		// popUp.innerHTML = "";
		// if (hideCode != game.gameData.status.statusCode) {
			// hideCode = "";
		// }
	// }
	// document.getElementById("topBot").innerText = game.liveData.linescore.inningState;
	// document.getElementById("innNum").innerText = game.liveData.linescore.currentInningOrdinal;
	try {
		document.getElementById(tm.homeAway+"WPImg").src = tm.team.logos[0].href;
	} catch (err) {
		document.getElementById(tm.homeAway+"WPImg").src = "";
	}
	try {
		r.style.setProperty("--"+tm.homeAway+"Logo","url('"+(tm.team.logos[1].href) + "')");
	} catch {
		try {
			r.style.setProperty("--"+tm.homeAway+"Logo","url('"+(tm.team.logos[0].href) + "')");
		} catch {
			
		}
	}
	document.getElementById(tm.homeAway+"WPSpan").style.backgroundColor = "#" + tm.team.color;
	if (tm.team.color) {
		r.style.setProperty("--"+tm.homeAway+"Bg","#"+tm.team.color);
	}
	if (tm.team.alternateColor) {
		if (isSimilar(hexToRgb(tm.team.color),hexToRgb(tm.team.alternateColor)) && isSimilar(hexToRgb(tm.team.color),hexToRgb("FFFFFF"))) {
			r.style.setProperty("--"+tm.homeAway+"T","#000000");
		} else if (isSimilar(hexToRgb(tm.team.color),hexToRgb(tm.team.alternateColor))) {
			r.style.setProperty("--"+tm.homeAway+"T","#FFFFFF");
		} else {
			r.style.setProperty("--"+tm.homeAway+"T","#"+tm.team.alternateColor);
		}
	} else if (tm.team.color == "000000") {
		r.style.setProperty("--"+tm.homeAway+"T","#FFFFFF");
	}
	var lead = game.leaders.filter(e => e.team.id == tm.id)[0];
	console.log(lead);

	var flTrb = [];
	var onCourt = [];
	var box = new Object();
	try {
		box = game.boxscore.players.filter(e => e.team.id == tm.id);
		console.log(box);
		var onCourt = box[0].statistics[0].athletes.filter(e => e.active);
		if (onCourt.length == 0) {
			onCourt = box[0].statistics[0].athletes.filter(e => e.starter);
		}
		var flKey = box[0].statistics[0].keys.indexOf("fouls");
		if (lastPlay.period.number <= game.format.regulation.periods/2) {
			flTrb = box[0].statistics[0].athletes.filter(e => e.stats[flKey] >= 2 || e.ejected);
		} else {
			flTrb = box[0].statistics[0].athletes.filter(e => e.stats[flKey] >= 3 || e.ejected);
		}
	} catch (err) {
		
	}
	var ptsKey = box[0].statistics[0].keys.indexOf("points");
	var rebKey = box[0].statistics[0].keys.indexOf("rebounds");
	var astKey = box[0].statistics[0].keys.indexOf("assists");
	var stlKey = box[0].statistics[0].keys.indexOf("steals");
	var blkKey = box[0].statistics[0].keys.indexOf("blocks");
	var leadOrd = ["Pt","Ast","Reb"];
	console.log(flTrb);
	document.getElementById(tm.homeAway+"Fls").innerHTML = "Foul Trouble";
	if (flTrb.length == 0) {
		document.getElementById(tm.homeAway+"Fls").innerHTML +="<br/>NONE";
	}
	for (var j = 0; j < flTrb.length; j++) {
		document.getElementById(tm.homeAway + "Fls").innerHTML+="<br/>"+flTrb[j].athlete.shortName;
		if (flTrb[j].stats[flKey] == 5) {
			 document.getElementById(tm.homeAway + "Fls").innerHTML+= " - OUT";
		} else if (flTrb.ejected) {
			document.getElementById(tm.homeAway + "Fls").innerHTML+= " - EJE";
		} else {
			document.getElementById(tm.homeAway + "Fls").innerHTML+= " - " + flTrb[j].stats[flKey];
		}
	}
	for (var j = 0; j < onCourt.length; j++) {
		try {
			document.getElementById(tm.homeAway+"P"+(j+1)).innerHTML = "<span id=\""+tm.homeAway+"P"+(j+1)+"Num\" class=\""+tm.homeAway+"Num\"></span><span id=\""+tm.homeAway+"P"+(j+1)+"Pos\" class=\""+tm.homeAway+"Pos\"></span>"+"<img src=\""+onCourt[j].athlete.headshot.href+"\" alt=\""+onCourt[j].athlete.headshot.alt+"\"><br/>"+onCourt[j].athlete.headshot.alt;
		} catch(err) {
			document.getElementById(tm.homeAway+"P"+(j+1)).innerHTML = "<span id=\""+tm.homeAway+"P"+(j+1)+"Num\" class=\""+tm.homeAway+"Num\"></span><span id=\""+tm.homeAway+"P"+(j+1)+"Pos\" class=\""+tm.homeAway+"Pos\"></span>" + "<img src=\"\" alt=\""+onCourt[j].athlete.displayName+"\" class=\"noImg\">";
		}
		document.getElementById(tm.homeAway+"P"+(j+1)).innerHTML+= "<br/>"+onCourt[j].stats[ptsKey] + " PTS " + onCourt[j].stats[rebKey]+ " REB " + onCourt[j].stats[astKey] + " AST";
		if (onCourt[j].stats[blkKey] > 2) {
			document.getElementById(tm.homeAway+"P"+(j+1)).innerHTML+= " " + onCourt[j].stats[blkKey] + " BLK";
		}
		if (onCourt[j].stats[stlKey] > 2) {
			document.getElementById(tm.homeAway+"P"+(j+1)).innerHTML+= " " + onCourt[j].stats[stlKey] + " STL";
		}
		document.getElementById(tm.homeAway+"P"+(j+1)+"Num").innerText = onCourt[j].athlete.jersey;
		document.getElementById(tm.homeAway+"P"+(j+1)+"Pos").innerText = onCourt[j].athlete.position.abbreviation;
	}
	for (var j = 0; j < lead.leaders.length; j++) {
		var ad = document.getElementById(tm.homeAway+leadOrd[j]+"Ld");
		ad.innerHTML = lead.leaders[j].displayName + " Leader<br/>";
		try {
			ad.innerHTML+= "<img src=\"" + lead.leaders[j].leaders[0].athlete.headshot.href+"\"/><br/>";
		} catch (err) {
		}
		try {
			ad.innerHTML+= "#" + lead.leaders[j].leaders[0].athlete.jersey + " " + lead.leaders[j].leaders[0].athlete.shortName + " (" + lead.leaders[j].leaders[0].displayValue + ")";
		} catch (err) {
			ad.innerHTML += "None";
		}
	}
	}
	var timeLeft = "";
	if (lastPlay.clock && lastPlay.clock.displayValue == "0:00") {
		timeLeft = "End " + lastPlay.period.displayValue;
	} else if (lastPlay.clock) {
		timeLeft+= lastPlay.clock.displayValue + " " + lastPlay.period.displayValue;
	}
	var timeSpl = [timeLeft.substring(0,timeLeft.length/2),timeLeft.substring(timeLeft.length/2)];
	document.getElementById("awayDesc").innerText = timeSpl[0];
	document.getElementById("homeDesc").innerText = timeSpl[1];
	// if (game.liveData.linescore.offense.first) {
		// document.getElementById("firstBase").className+= " runner";
		// r1 = true;
		// console.log("runner first");
		// r.style.setProperty("--first","url("+getPhotoUrl(game.liveData.linescore.offense.first.id)+")");
	// } else {
		// document.getElementById("firstBase").className = document.getElementById("firstBase").className.replaceAll(" runner","");
		// r1 = false;
		// r.style.setProperty("--first","url()");
	// }
	// if (game.liveData.linescore.offense.second) {
		// document.getElementById("secondBase").className+= " runner";
		// r2 = true;
		// r.style.setProperty("--second","url("+getPhotoUrl(game.liveData.linescore.offense.second.id)+")");
	// } else {
		// document.getElementById("secondBase").className = document.getElementById("secondBase").className.replaceAll(" runner","");
		// r2 = false;
		// r.style.setProperty("--second","url()");
	// }
	// if (game.liveData.linescore.offense.third) {
		// document.getElementById("thirdBase").className+= " runner";
		// r3 = true;
		// r.style.setProperty("--third","url("+getPhotoUrl(game.liveData.linescore.offense.third.id)+")");
	// } else {
		// document.getElementById("thirdBase").className = document.getElementById("thirdBase").className.replaceAll(" runner","");
		// r3 = false;
		// r.style.setProperty("--third","url()");
	// }
	// var dayNight = game.gameData.datetime.dayNight;
	// day = dayOfWeek[new Date(game.gameData.datetime.dateTime).getDay()].toLowerCase();
	// var tmCode = game.gameData.teams[ha].fileCode;
	// document.getElementById(ha).className = tmCode + " " + ha + " " + dayNight + " " + day;
	// document.getElementById(ha + "WPSpan").className = tmCode + " " + ha + " " + dayNight + " " + day;
	// vars = game;
	/*var isPitch = game.liveData.linescore.isTopInning == (ha == "home");
	console.log(ha);
	var split;
	if (isPitch) {
		split = "pitcher";
	} else {
		split = "batter";
	}
	var homeAway;
	if (ha == "home") {
		homeAway = "home";
	} else {
		homeAway = "away";
	}
	// var div = document.createElement("div");
	// div.className = "vertJust";
	var pitchID;
	if (isPitch) {
		pitchID = game.liveData.plays.currentPlay.matchup.pitcher.id;
	} else {
		pitchID = game.liveData.plays.currentPlay.matchup.batter.id;
	}
	var top = document.getElementById(ha + "Top");//document.createElement("h2");
	if (ha == "away") {
		top.innerHTML = "<span id=\"awayName\">" + game.gameData.teams.away.clubName + '</span> <span id="awayScore">' + game.liveData.linescore.teams.away.runs+"</span>";
	} else {
		top.innerHTML = "<span id='homeScore'>"+ game.liveData.linescore.teams.home.runs + '</span> <span id="homeName">' + game.gameData.teams.home.clubName+"</span>";
	}
	var img = document.getElementById(ha+"Feat");//createElement("img");
	img.setAttribute("src","https://midfield.mlbstatic.com/v1/people/"+pitchID+"/silo/360");
	if (isPitch) {
		img.setAttribute("alt",game.liveData.plays.currentPlay.matchup.pitcher.fullName);
		document.getElementById(ha+"Nm").setAttribute("alt",game.liveData.plays.currentPlay.matchup.pitcher.fullName);
	} else {
		img.setAttribute("alt",game.liveData.plays.currentPlay.matchup.batter.fullName);
		document.getElementById(ha+"Nm").setAttribute("alt",game.liveData.plays.currentPlay.matchup.batter.fullName);
	}
	//img.className = "featured";
	var summ = document.getElementById(ha+"Summ");//createElement("p");
	if (game.liveData.linescore.isTopInning == (ha == "home")) {
		summ.innerText = game.liveData.boxscore.teams[ha].players["ID"+pitchID].stats.pitching.summary + ", " + (game.liveData.boxscore.teams[ha].players["ID"+pitchID].stats.pitching.pitchesThrown || "0") + " pitches ("  +game.liveData.boxscore.teams[ha].players["ID"+pitchID].stats.pitching.strikes + " strikes)";
	} else {
		summ.innerText = game.liveData.boxscore.teams[ha].players["ID"+pitchID].stats.batting.summary;
	}
	var search = baseURL;
	if (isPitch) {
		search = baseURL + "/api/v1/people/"+ pitchID + "?hydrate=stats(group=pitching,type=[seasonAdvanced,pitchArsenal,sabermetrics,statSplits,statSplitsAdvanced],sitCodes="+getMatchupData(game.liveData.plays.currentPlay.matchup.splits.pitcher)+")"
	} else {
		search = baseURL + "/api/v1/people/"+pitchID+"?hydrate=stats(group=hitting,type=[seasonAdvanced,statSplits,sabermetrics,statSplitsAdvanced],sitCodes=["+getMatchupData(game.liveData.plays.currentPlay.matchup.splits.batter)+",c"+game.liveData.plays.currentPlay.count.balls + game.liveData.plays.currentPlay.count.strikes;
		if (r1 && r2 && r3) {
			search+=",r123";
			loaded = true;
		} else if ((r2 || r3) && game.liveData.linescore.outs == 2) {
			search+= ",risp2";
			risp2 = true;
		} else if (r3 && game.liveData.linescore.outs < 2) {
			search+= ",r3l2";
			r3l2 = true;
		}
		search+= "])";
	}
	// var wP;
	getData(search).then((value) => {
		var srch;
		if (!isPitch) {
			srch = baseURL + "/api/v1/stats?group=hitting&sportIds=1&stats=metricAverages&personId="+pitchID+"&metrics=launchSpeed,launchAngle,distance";
		} else {
			srch = baseURL + "/api/v1/stats?group=pitching&sportIds=1&stats=metricAverages&metrics=releaseSpinRate&personId="+pitchID;
		}
		getData(srch).then((met) => {
		console.log(value);
		var val = makeSplitsWork(value.people[0].stats);
		console.log(val);
		var pitches;
		var pitches = document.getElementById(ha+"Pitches");//createElement("ul");
		if (isPitch) {
			pitches.innerHTML = "";
			for (var i = 0; i < val.pitchArsenal.length; i++) {
			var p = document.createElement("li");
			console.log(met);
			var rpm = met.stats[0].splits.filter(e => e.stat.event && e.stat.event.details.type.code == val.pitchArsenal[i].stat.type.code)[0];
			p.innerText = val.pitchArsenal[i].stat.type.description + " - " + (Math.round(val.pitchArsenal[i].stat.averageSpeed*10)/10) + " MPH/"+ rpm.stat.metric.averageValue+ " RPM ("+(Math.round(val.pitchArsenal[i].stat.percentage * 1000)/10) + "%)";
			pitches.appendChild(p);
		}
		} else {
			pitches.innerHTML = "";
		}
		//babip, k/9, p/ip, p/pa
		//var head = document.createElement("h3");
		// head.innerText = "Advanced Stats";
		statsAgainst = document.getElementById(ha+"Adv");//createElement("p");
		statsAgainst.innerHTML = val.seasonAdvanced.pitchesPerPlateAppearance;
		if (isPitch) {
			statsAgainst.innerHTML += " Pitches/BF&emsp;" + val.seasonAdvanced.strikeoutsPer9 + " K/9&emsp;";
		} else {
			statsAgainst.innerHTML+= " Pitches/PA&emsp;"
		}
		statsAgainst.innerHTML += val.seasonAdvanced.babip;
		if (isPitch) {
			statsAgainst.innerHTML+=" BAABIP<br>"+Math.round(val.sabermetrics.eraMinus)+" ERA&ndash;&emsp;";
		} else {
			statsAgainst.innerHTML+=" BABIP<br>" + Math.round(val.sabermetrics.wRcPlus) + " wRC+&emsp;";
		}
		statsAgainst.innerHTML+= (Math.round(val.sabermetrics.war*100)/100)+ " WAR";
		if (!isPitch) {
			statsAgainst.innerHTML+="<br>"+met.stats[0].splits[1].stat.metric.averageValue + "&deg; AVG Launch Angle&emsp;"+met.stats[0].splits[0].stat.metric.averageValue+ " MPH AVG Exit Velo";
		}
		var handH = document.getElementById(ha+"VsHand");//createElement("h3");
		handH.innerText = game.liveData.plays.currentPlay.matchup.splits[split].replaceAll("_"," ");
		var hand = document.getElementById(ha+"HandStats");//createElement("p");
		if (isPitch) {
			hand.innerHTML = val.statSplits[getMatchupData(game.liveData.plays.currentPlay.matchup.splits.pitcher)].ops + " OPS&emsp;"+val.statSplits[getMatchupData(game.liveData.plays.currentPlay.matchup.splits.pitcher)].avg + " BAA&emsp;" + val.statSplits[getMatchupData(game.liveData.plays.currentPlay.matchup.splits.pitcher)].strikeoutWalkRatio+" K:BB";
		} else {
			hand.innerHTML = val.statSplits[getMatchupData(game.liveData.plays.currentPlay.matchup.splits.batter)].avg + " AVG&emsp;"+val.statSplits[getMatchupData(game.liveData.plays.currentPlay.matchup.splits.batter)].ops + " OPS&emsp;"+val.statSplitsAdvanced[getMatchupData(game.liveData.plays.currentPlay.matchup.splits.batter)].extraBaseHits+" XBH&emsp;" + val.statSplits[getMatchupData(game.liveData.plays.currentPlay.matchup.splits.batter)].plateAppearances+" PA<br></p>";
			if (!game.liveData.plays.currentPlay.isComplete && val.statSplits["c"+game.liveData.plays.currentPlay.count.balls+game.liveData.plays.currentPlay.count.strikes]) {
				hand.innerHTML+="<p><h3>"+game.liveData.plays.currentPlay.count.balls+"-"+game.liveData.plays.currentPlay.count.strikes+" count"+"</h3>"+val.statSplits["c"+game.liveData.plays.currentPlay.count.balls+game.liveData.plays.currentPlay.count.strikes].avg + " AVG&emsp;"+val.statSplits["c"+game.liveData.plays.currentPlay.count.balls+game.liveData.plays.currentPlay.count.strikes].ops+ " OPS&emsp;"+val.statSplitsAdvanced["c"+game.liveData.plays.currentPlay.count.balls+game.liveData.plays.currentPlay.count.strikes].extraBaseHits+ " XBH&emsp;"+val.statSplits["c"+game.liveData.plays.currentPlay.count.balls+game.liveData.plays.currentPlay.count.strikes].leftOnBase+ " LOB&emsp;";
				if (game.liveData.plays.currentPlay.count.balls == 3) {
					hand.innerHTML+= val.statSplits["c"+game.liveData.plays.currentPlay.count.balls+game.liveData.plays.currentPlay.count.strikes].baseOnBalls + " BB&emsp;";
				}
				if (game.liveData.plays.currentPlay.count.strikes == 2) {
					hand.innerHTML+= val.statSplits["c"+game.liveData.plays.currentPlay.count.balls+game.liveData.plays.currentPlay.count.strikes].strikeOuts + " SO&emsp;";
				}
				hand.innerHTML+= val.statSplits["c"+game.liveData.plays.currentPlay.count.balls+game.liveData.plays.currentPlay.count.strikes].plateAppearances+ " PA";
			}
			if (game.liveData.linescore.currentInning>= 9 && !game.liveData.linescore.isTopInning && game.liveData.plays.currentPlay.runners.length > (game.liveData.linescore.teams.away.runs - game.liveData.linescore.teams.home.runs)) {
				hand.innerHTML+= "<br>"+val.seasonAdvanced.walkOffs+ " walk-offs";
			}
			if (loaded) {
				//avg, ops, hr, rbi, pa
				hand.innerHTML += "</p><h3>Bases Loaded</h3><p>"+val.statSplits["r123"].avg + " AVG&emsp;"+val.statSplits["r123"].ops+ " OPS&emsp;"+val.statSplits.r123.homeRuns + " HR&emsp;" + val.statSplits.r123.rbi + " RBI&emsp;"+ val.statSplits.r123.plateAppearances + " PA";
			} else if (risp2) {
				hand.innerHTML += "</p><h3>RISP, 2 out</h3><p>"+val.statSplits["risp2"].avg + " AVG&emsp;"+val.statSplits["risp2"].ops+ " OPS&emsp;"+val.statSplitsAdvanced.risp2.extraBaseHits + " XBH&emsp;" + val.statSplitsAdvanced.risp2.leftOnBase + " LOB&emsp;"+ val.statSplitsAdvanced.risp2.plateAppearances + " PA";
			} else if (r3l2) {
				hand.innerHTML += "</p><h3>Runner on 3rd, &lt;2 out</h3><p>"+val.statSplits["r3l2"].avg + " AVG&emsp;"+val.statSplits["r3l2"].ops+ " OPS&emsp;"+val.statSplitsAdvanced.r3l2.extraBaseHits + " XBH&emsp;" + val.statSplitsAdvanced.r3l2.leftOnBase + " LOB&emsp;"+ val.statSplitsAdvanced.r3l2.plateAppearances + " PA";
			}
		}
		// var duh = document.createElement("h3");
		// duh.innerText = "DUE UP";
		if (game.gameData.status.statusCode != "O" && game.gameData.status.statusCode != "F") {
			var due = document.getElementById(ha+"Due");//createElement("span");
			due.className = "dueUp";
			var pics = [];
			due.innerHTML = "";
			for (var i = 0; i < 3; i++) {
				pics[i] = document.createElement("img");
				due.appendChild(pics[i]);
			}
			if ((isPitch && game.liveData.linescore.outs < 3 )|| (!isPitch && game.liveData.linescore.outs == 3 && (game.gameData.status.statusCode != "F" && game.gameData.status.statusCode != "O"))) {
				pics[0].src = getPhotoUrl(game.liveData.linescore.defense.batter.id);
				pics[1].src = getPhotoUrl(game.liveData.linescore.defense.onDeck.id);
				pics[2].src = getPhotoUrl(game.liveData.linescore.defense.inHole.id);
			}  else if (isPitch && game.liveData.linescore.outs == 3) {
				pics[0].src = getPhotoUrl(game.liveData.linescore.offense.batter.id);
				pics[1].src = getPhotoUrl(game.liveData.linescore.offense.onDeck.id);
				pics[2].src = getPhotoUrl(game.liveData.linescore.offense.inHole.id);
			}
			else {
				pics[0].src="";
				pics[1].src = getPhotoUrl(game.liveData.linescore.offense.onDeck.id);
				pics[2].src = getPhotoUrl(game.liveData.linescore.offense.inHole.id);
			}
		} else {
			document.getElementById(ha+"Duh").innerText = "";
			document.getElementById(ha+"Due").innerHTML="";
		}
		var bph = document.getElementById(ha+"BenchPen");//createElement("h3");
		if (isPitch) {
			bph.innerText = "IN BULLPEN";
		} else {
			bph.innerText = "ON BENCH";
		}
		var bPics = [];
		var bPen = document.getElementById(ha+"Pen");//createElement("span");
		bPen.innerHTML = "";
		// bPen.className = "bullpen"
		if (isPitch) {
			for (var i = 0; i < game.liveData.boxscore.teams[ha].bullpen.length; i++) {
				bPics[i] = document.createElement("img");
				bPics[i].src = getPhotoUrl(game.liveData.boxscore.teams[ha].bullpen[i]);
				bPen.appendChild(bPics[i]);
			}
		} else {
				for (var i = 0; i < game.liveData.boxscore.teams[ha].bench.length; i++) {
				bPics[i] = document.createElement("img");
				bPics[i].src = getPhotoUrl(game.liveData.boxscore.teams[ha].bench[i]);
				bPen.appendChild(bPics[i]);
			}
		}
		//div.append(top,img,summ,pitches,head,statsAgainst,handH,hand,duh,due,bph,bPen);
		//document.getElementById(ha).innerHTML = "";
		//document.getElementById(ha).appendChild(div);
		});});
	/*getData(baseURL + "/api/v1/game/"+game.gamePk+"/contextMetrics").then((valCM) => {
		console.log(valCM);
		for (var i = 0; i < 2; i++) {
			var wProbText = game.gameData.teams[twos[i]].abbreviation +  " Win&nbsp;Probability:&nbsp;"+(Math.round(valCM[twos[i]+"WinProbability"]*10)/10)+"%";
			document.getElementById(twos[i]+"WPSpan").style.width = valCM[twos[i]+"WinProbability"] + "%";
			document.getElementById(twos[i]+"WP").innerText = "";
			// document.getElementById(twos[i]+"WPSpan").innerText = "";
				// document.getElementById(twos[i]+"WPImg").src="";
				wP = document.getElementById(twos[i]+"WP");//createElement("span");
				// wP.className = 'winProb';
				wP.innerHTML = wProbText;
				// top.before(wP);
				// document.getElementById(twos[i]+"WPSpan").value=valCM.awayWinProbability;
			if (valCM[twos[i] + "WinProbability"] <= 2) {
				// document.getElementById(twos[i]+"WPSpan").innerHTML = wProbText;
				document.getElementById(twos[i]+"WPImg").style.opacity = "0";
				document.getElementById(twos[i]+"WPImg").style.width = "0";
			} else {
				document.getElementById(twos[i]+"WPImg").style.opacity = "1";
				document.getElementById(twos[i]+"WPImg").style.width = "3dvh";
			}
		}
	});*/
	
	
	document.getElementById("scores").style.display = "none";
	document.getElementById("game").style.display="block";
}
function getMatchupData(match) {
	if (match.includes("RH")) {
		return "vr";
	} else {
		return "vl";
	}
}
function makeSplitsWork(data) {
	ret = new Object();
	for (var i = 0; i < data.length; i++) {
		if (data[i].type.displayName != "pitchArsenal" && data[i].type.displayName != "statSplits" && data[i].type.displayName != "statSplitsAdvanced") {
			ret[data[i].type.displayName] = data[i].splits[0].stat;
		} else if (data[i].type.displayName == "pitchArsenal") {
			ret[data[i].type.displayName] = data[i].splits;
		} else if (data[i].type.displayName == "statSplits" || data[i].type.displayName == "statSplitsAdvanced") {
			ret[data[i].type.displayName] = new Object();
			for (var j = 0; j < data[i].splits.length; j++) {
				ret[data[i].type.displayName][data[i].splits[j].split.code] = data[i].splits[j].stat;
			}
		}
	}
	return ret;
}
function getPhotoUrl(id) {
	return "https://midfield.mlbstatic.com/v1/people/"+id+"/silo/360";
}
function getGameTime(dt) {
	var gTime = dt.substring(11).split(":");
	gTime[0] = (parseInt(gTime[0]) - timeOffset);
	if (gTime[0] < 0) {
		gTime[0] += 24;
	}
	if (gTime[0] < 12) {
		gTime[2] = " AM";
	} else {
		gTime[2] = " PM";
	}
	//return (gTime[0] % 12) + ":" + gTime[1] + gTime[2];
	var ret = new Date(dt).toLocaleTimeString();
	return ret.replaceAll(":00 "," ");
}
async function getData(url) {
	var ret;
	var jso = await fetch(url);
	ret = await jso.json();
	return ret;
}

function hideModal(code) {
	document.getElementById("popUp").style.display = "none";
	hideCode = code;
}
function splitInHalf(string) {
	var spl = [];
	spl.push(string.substring(0,Math.round(string.length/2)));
	spl.push(string.substring(Math.round(string.length/2)));
	return spl;
}
function delayTime() {
	document.getElementById("delaySec").innerText = document.getElementById("offset").value + "s";
}
function showSett() {
	document.getElementById("sett").style.display = "block";
}
function closeSett() {
	document.getElementById("sett").style.display = "none";
}
function hexToRgb(hex) {
	var ret = [];
	for (var i = 0; i < hex.length; i+= 2) {
		ret.push(parseInt(hex.substring(i,i+2),16));
	}
	return ret;
}
function isSimilar([r1, g1, b1], [r2, g2, b2]) {
  return Math.abs(r1-r2) < 50 &&  Math.abs(g1-g2) < 50 && Math.abs(b1-b2) < 50;
}
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}