var ieVersion = getInternetExplorerVersion();
if (ieVersion > 5 && ieVersion < 9) {
	alert("Ewww. We see you are using a version of Internet Explorer prior to version 9 (or running your new version in compatibility mode).  This application hasn't been tested on this browser.  We recommend Chrome, Firefox, Safari or Internet Explorer 9 or above.  You can also use this site on most mobile web browsers.")
}

$(document).live('pagechange', function(event, data) {
	var toPageId = data.toPage.attr("id");
	switch (toPageId) {
		case 'gamespage':
			renderGamesPage(data);
			break;
		default:
			renderMainPage(data);
	}
});

function renderMainPage(data) {
	$('.teamName').html("Admin of " + Ultimate.userName + " teams");
	populateTeamsList();
}

function renderGamesPage(data) {
	Ultimate.teamId = data.options.pageData.team;
	populateTeam(function() {
		populateGamesList();
	});
}

function renderGamePageBasics(data) {
	Ultimate.gameId = data.options.pageData.gameId;
	$('.gameStatsChoiceLink').attr('href','#gamestatspage?gameId=' + Ultimate.gameId);
	$('.gameEventsChoiceLink').attr('href', '#eventspage?gameId=' + Ultimate.gameId);
}


$('.pagediv').live('pageinit', function(event, data) {
	registerPageSwipeHandler('mainPage', 'swipeleft', '#teamsPage');
	registerPageSwipeHandler('teamsPage', 'swiperight', '#mainPage');
});

function registerPageSwipeHandler(pageSource, swipeEvent, pageTarget) {
	$('#' + pageSource).off(swipeEvent).on(swipeEvent, function(event, data) { // off called because need to ensure only one swipe handler
		$.mobile.changePage(pageTarget, {
			transition : 'slide',
			reverse : swipeEvent == 'swiperight'
		});
	});
}

function populateTeamsList(successFunction) {
	if (!Ultimate.teams) {
		retrieveTeams(function(teams) {
			Ultimate.teams = teams;
			updateTeamsList(Ultimate.teams);
			if (successFunction) {
				successFunction();
			}
		}) 
	} else {
		updateTeamsList(Ultimate.teams);
		if (successFunction) {
			successFunction();
		}
	}
}

function updateTeamsList(teams) {
		var html = [];
		for ( var i = 0; i < teams.length; i++) {
			var team = teams[i];
			html[html.length] = '<li><a href="#gamespage?team=';
			html[html.length] = team.cloudId;
			html[html.length] = '">'
			html[html.length] = team.name;
			html[html.length] = ' (team ID = ';
			html[html.length] = team.cloudId;
			html[html.length] = ')</a></li>';
		}
		$("#teams").empty().append(html.join('')).listview("refresh");
}

function populateTeam(successFunction) {
	if (!Ultimate.teamName) {
		retrieveTeam(Ultimate.teamId, false, function(team) {
			Ultimate.team = team;
			Ultimate.teamName = team.name;
			$('.teamName').html(Ultimate.teamName + " Admin");
			if (successFunction) {
				successFunction();
			}
		}) 
	} else {
		$('.teamName').html(Ultimate.teamName + " Admin");
		if (successFunction) {
			successFunction();
		}
	}
}

function populateGamesList() {
	retrieveGames(Ultimate.teamId, function(games) {
		Ultimate.games = games;
		updateGamesList(Ultimate.games);
	}) 
}

function updateGamesList(games) {
	var sortedGames = sortGames(games);
	var html = [];
	for ( var i = 0; i < sortedGames.length; i++) {
		var game = sortedGames[i];
		html[html.length] = '<li><a href="#eventspage?gameId=';
		html[html.length] =  game.gameId;
		html[html.length] = '">';
		html[html.length] = '<span class="game-date">';
		html[html.length] = game.date;
		html[html.length] = '&nbsp;&nbsp;';
		html[html.length] = game.time;
		html[html.length] = '</span>&nbsp;&nbsp;';		
		html[html.length] = '<span class="opponent">vs. ';
		html[html.length] = game.opponentName;
		html[html.length] = '</span>';
		html[html.length] = '<span class="tournament">';
		html[html.length] = isBlank(game.tournamentName) ?  '&nbsp;&nbsp;&nbsp;' : '&nbsp;&nbsp;at ' + game.tournamentName;
		html[html.length] = '</span>&nbsp;&nbsp;';		
		html[html.length] = '<span class="score '; 
		html[html.length] = game.ours > game.theirs ? 'ourlead' : game.theirs > game.ours ? 'theirlead' : ''; 
		html[html.length] = '">';
		html[html.length] = game.ours;
		html[html.length] = '-';
		html[html.length] = game.theirs;
		html[html.length] = '</span>';
		html[html.length] = '</a></li>';
	}
	$("#games").empty().append(html.join('')).listview("refresh");
}

function isBlank(s) {
	return s == null || s == '';
}

