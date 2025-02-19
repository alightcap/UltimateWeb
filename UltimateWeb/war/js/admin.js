var ieVersion = getInternetExplorerVersion();
if (ieVersion > 5 && ieVersion < 9) {
	alert("Ewww. We see you are using a version of Internet Explorer prior to version 9 (or running your new version in compatibility mode).  This application hasn't been tested on this browser.  We recommend Chrome, Firefox, Safari or Internet Explorer 9 or above.  You can also use this site on most mobile web browsers.")
}

$(document).live('pagechange', function(event, data) {
	renderAppLink();
	$('.logout').attr('href', Ultimate.logoutUrl);
	switch (getCurrentPageId()) {
		case 'mainpage':
			renderMainPage(data);
			break;
		case 'teamsettingspage':
			renderSettingsPage(data);
			break;	
		case 'teamgamespage':
			renderGamesPage(data);
			break;	
		case 'teamplayerspage':
			renderPlayersPage(data);
			break;				
		case 'confirmDeleteDialog':
			renderConfirmDeleteDialog(data);
			break;	
		case 'importGameDialog':
			renderImportGameDialog(data);
			break;			
		case 'teamPasswordDialog':
			renderTeamPasswordDialog(data);
			break;		
		case 'playerChangeDialog':
			renderPlayerChangeDialog(data);
			break;	
		case 'gameVersionsDialog':
			renderGameVersionDialog(data);
			break;				
		default:
			//
	}
});

function getCurrentPageId() {
	return $.mobile.activePage.attr('id');
}

function renderAppLink() {
	var isIOS = (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i));
	$('.appLink').prop('href', 'iultimate://').toggleClass('hidden', !isIOS);
}


function renderMainPage(data) {
	$('.adminUser').html(Ultimate.userName);
	populateTeamsList();
}

function renderSettingsPage(data) {
	Ultimate.teamId = data.options.pageData.team;
	populateTeam(function() {
		$('.teamPassword').html(Ultimate.team.password == null ? "NOT SET" : Ultimate.team.password);
		$('.teamPassword').unbind().on('click', function() {
			handleSetPasswordClicked();
		});
		registerTeamPageRadioButtonHandler('teamsettingspage');
	}, handleRestError);
}

function renderGamesPage(data) {
	Ultimate.teamId = data.options.pageData.team;
	$('.importGameLink').unbind().on('click', function() {
		handleImportGameClicked();
	});
	populateTeam(function() {
		populateGamesList();
		registerTeamPageRadioButtonHandler('teamgamespage');
	}, handleRestError);
}

function renderPlayersPage(data) {
	Ultimate.teamId = data.options.pageData.team;
	populateTeam(function() {
		$('#playersList').html(createPlayerListHtml(Ultimate.team)).listview('refresh');
		registerTeamPageRadioButtonHandler('teamplayerspage');
	}, handleRestError);
}

function renderConfirmDeleteDialog(data) {
	$('#deleteDescription').html(Ultimate.itemToDeleteDescription);
	$('#deleteConfirmedButton').unbind().on('click', function() {
			Ultimate.deleteConfirmedFn();
		});
}

function renderImportGameDialog(data) {
	$('.importGameForm').attr('action', urlForGameExportFileUpload(Ultimate.team.cloudId));
}

function renderTeamPasswordDialog(data) {
	var team = Ultimate.team;
	$('#passwordSaveErrorMessage').html("");
	$('#teamPasswordInput').val(team.password);
	if (isNullOrEmpty(team.password)) {
		$('#removePasswordButton').css('display', 'none');		
	} else {
		$('#removePasswordButton').css('display', '').unbind().on('click', function() {
			submitPassword(Ultimate.team.cloudId, null);
		});
	}
	$('#savePasswordButton').unbind().on('click', function() {
		var newPwd = $('#teamPasswordInput').val();
		submitPassword(Ultimate.team.cloudId, newPwd);
	});
}

function renderGameVersionDialog(data) {
	var currentVersion = Ultimate.gameVersions.current;
	$('#game-version_current-description').html(currentVersion.updateUtc + ' GMT, score: ' + currentVersion.ourScore + '-' + currentVersion.theirScore + ', ' + currentVersion.description);
	
	var game = {};
	game.versions = Ultimate.gameVersions;
	$('#gameVersionsList').html(createGameVersionsListHtml(game)).selectmenu('refresh');
	$('#game-version-dialog-doit-button').unbind().on('click', function() {
		var versionId = $('#gameVersionsList option:selected').val();
		restoreGameVersion(Ultimate.teamId, Ultimate.gameId, versionId, function() {
			alert('Game version updated.');
			resetCacheBuster();
			populateTeam(function() {
				$.mobile.changePage('#teamgamespage?team=' + Ultimate.teamId, {transition: 'pop'});
			}, handleRestError);
		})
	});
}

function renderPlayerChangeDialog(data) {
	var team = Ultimate.team;
	var player = data.options.pageData.player;
	var change = data.options.pageData.change;
	if (change == 'merge') {
		renderDeletePlayerDialog(team, player, true);
	} else if (change == 'delete') {
		renderDeletePlayerDialog(team, player, false);
	} else if (change == 'rename') {
		renderRenamePlayerDialog(team, player);
	}
}

function renderDeletePlayerDialog(team, player, isMerge) {
	if (isMerge) {
		configurePlayerMoveDialogForMerge(player);
	} else {
		configurePlayerMoveDialogForDelete(player);
	}
	$('.player-change-dialog-player').html(player);
	$('#moveToPlayerList').html(createMoveToPlayerListHtml(team)).selectmenu('refresh');
	$('#player-change-dialog-doit-button').unbind().on('click', function() {
		var toPlayer = $('#moveToPlayerList option:selected').val();
		deletePlayer(Ultimate.teamId, player, toPlayer, function() {
			alert('Player ' + player + ' deleted.  Associated data moved to player ' + toPlayer + 
					". If you still have games on your mobile device with player " + player + 
					" you should now download those games to your device (otherwise " 
					+ player + " will re-appear when you next upload those games).");
			resetCacheBuster();
			populateTeam(function() {
				$.mobile.changePage('#teamplayerspage?team=' + Ultimate.teamId, {transition: 'pop'});
			}, handleRestError);
		})
	});
}

function renderRenamePlayerDialog(team, playerName) {
	var player = playerNamed(playerName);
	configurePlayerMoveDialogForRename(playerName);
	var oldFirstName = trimString(playerNamed(playerName).firstName);
	var oldLastName = trimString(playerNamed(playerName).lastName);
	$('.player-change-dialog-player').html(playerName);
	$('#moveToPlayerList').html(createMoveToPlayerListHtml(team)).selectmenu('refresh');
	$('#player-change-dialog-doit-button').unbind().on('click', function() {
		var newName = trimString($('#player-change-dialog-player-new-nickname-field').val());
		var firstName = trimString($('#player-change-dialog-player-new-displayfirstname-field').val());
		var lastName = trimString($('#player-change-dialog-player-new-displaylastname-field').val());
		if (newName == '' || newName.toLowerCase() == 'anonymous' || newName.toLowerCase() == 'anon' || newName.toLowerCase() == 'unknown' ) {
			alert('Sorry..that is an invalid nickname');
		} else if (newName.length > 8) {  // text field has max chars set so should not ever hit this line
			alert('Sorry...nickname must be less than 9 characters');	
		} else if (newName == playerName && oldFirstName == firstName && oldLastName == lastName) {  
			alert('You did not change the nick name or display name');				
		} else {
			renamePlayer(Ultimate.teamId, playerName, newName, firstName, lastName, function() {
				var message = 'No changes made';
				if (newName != playerName) {
					message = 'Player ' + playerName + ' renamed to ' + newName +
					'. If you still have games on your mobile device with player ' + playerName + 
					' you should now download the team and those games to your device (otherwise ' 
					+ playerName + ' will re-appear when you next upload those games).';
				} else if (firstName != oldFirstName || lastName != oldLastName) {
					message = (firstName ==  '' && lastName ==  '') ? 
							'Player ' + playerName + ' display name removed.' :
							'Player ' + playerName + ' display name changed to ' + firstName + ' ' + lastName + '.';
				}
				alert(message);
				resetCacheBuster();
				populateTeam(function() {
					$.mobile.changePage('#teamplayerspage?team=' + Ultimate.teamId, {transition: 'pop'});
				}, handleRestError);
			})
		}
	});
}

function populateTeamsList(successFunction) {
	retrieveTeamsIncludingDeleted(function(teams) {
		Ultimate.teams = teams;
		updateTeamsList(Ultimate.teams);
		if (successFunction) {
			successFunction();
		}
	},handleRestError);
}

function updateTeamsList(teams) {
		var html = [];
		for ( var i = 0; i < teams.length; i++) {
			var team = teams[i];
			var deleteUndeleteImage = team.deleted ? 'undelete-entity.png' : 'delete-entity.png';
			var decorationClass = team.deleted ? 'deleted-entity' : '';
			var teamUrl =  team.deleted ? '' : '#teamsettingspage?team=' + team.cloudId;
			html[html.length] = '<li class="' + decorationClass + '"><a href="' + teamUrl;
			html[html.length] = '"><img class="teamDeleteButton listImage" src="/images/' + deleteUndeleteImage + '" data-teamname="';
			html[html.length] = team.name + ' (team ID ' + team.cloudId + ')';
			html[html.length] = '" data-teamid="';
			html[html.length] = team.cloudId;
			html[html.length] = '" />'
			html[html.length] = team.name;
			html[html.length] = ' (team ID = ';
			html[html.length] = team.cloudId;
			html[html.length] = ')</a></li>';
		}
		$("#teams").empty().append(html.join('')).listview("refresh");
		$('.teamDeleteButton').unbind().on('click', function() {
			$deleteButton = $(this);
			Ultimate.itemToDeleteDescription = $deleteButton.data('teamname');
			Ultimate.itemToDeleteId = $deleteButton.data('teamid');
			var team = getTeam(Ultimate.itemToDeleteId);
			if (team.deleted) {
				undeleteTeam(Ultimate.itemToDeleteId, function() {
					alert('Team restored');
					resetCacheBuster();
					$.mobile.changePage('#mainpage', {transition: 'pop'});
				},handleRestError);
			} else {
				Ultimate.deleteConfirmedFn = function() {
					deleteTeam(Ultimate.itemToDeleteId, function() {
						alert("Team deleted.  You may undo the deletion at any time");
						resetCacheBuster();
						$.mobile.changePage('#mainpage', {transition: 'pop'});
					},handleRestError);
				};
				$.mobile.changePage('#confirmDeleteDialog', {transition: 'pop', role: 'dialog'});   
				
				return false;
			}
		})
}

function populateTeam(successFunction) {
	retrieveTeamForAdmin(Ultimate.teamId, true, true, function(team) {
		Ultimate.team = team;
		Ultimate.teamName = team.name;
		$('.inactive-player-footnote').css('display', 'none');
		if (team.players) {
			for (var i = 0; i < team.players.length; i++) {
				var player = team.players[i];
				var playerNumberName = player.name;
				if (player.number != null && player.number != '') {
					playerNumberName = '#' + player.number + ' ' + playerNumberName;
				}
				player.description = $('<div/>').text(playerNumberName).html(); // escape the name/number
				if (player.inactive) {
					$('.inactive-player-footnote').css('display', 'block');
					player.description += ' (inactive<sup>1</sup>)';
				} else if (player.firstName || player.lastName) {
					player.description += ' (';
					if (player.firstName) {
						player.description += player.firstName;
					}
					if (player.lastName) {
						if (player.firstName) {
							player.description += ' ';
						}
						player.description += player.lastName;
					}
					player.description += ')';
				} 
			}
		}
		var teamTitle = Ultimate.teamName + ', team ID ' + Ultimate.teamId;
		$('.teamTitle').html(teamTitle);
		$('.teamWebsite').attr('href', '/team/' + Ultimate.teamId + '/main');
		if (successFunction) {
			successFunction();
		}
	}, handleRestError);
}

function populateGamesList() {
	retrieveGamesForAdmin(Ultimate.teamId, function(games) {
		Ultimate.games = games;
		updateGamesList(Ultimate.games);
		$('.gameDeleteButton').unbind().on('click', function() {
			$deleteButton = $(this);
			Ultimate.itemToDeleteDescription = 'game ' + decodeURIComponent($deleteButton.data('description'));
			Ultimate.itemToDeleteId = $deleteButton.data('game');
			var game = getGame(Ultimate.itemToDeleteId);
			if (game.deleted) {
				undeleteGame(Ultimate.teamId, Ultimate.itemToDeleteId, function() {
					alert("Game restored");
					resetCacheBuster();
					$.mobile.changePage('#teamsettingspage?team=' + Ultimate.teamId, {transition: 'pop'});
				},handleRestError);
			} else {
				Ultimate.deleteConfirmedFn = function() {
					deleteGame(Ultimate.teamId, Ultimate.itemToDeleteId, function() {
						alert("Game deleted.  You may undo the deletion at any time");
						resetCacheBuster();
						$.mobile.changePage('#teamsettingspage?team=' + Ultimate.teamId, {transition: 'pop'});
					},handleRestError);
				};
				$.mobile.changePage('#confirmDeleteDialog', {transition: 'pop', role: 'dialog'});  
			}
		})
	}) 
}

function updateGamesList(games) {
	var sortedGames = sortGames(games);
	var html = [];
	for ( var i = 0; i < sortedGames.length; i++) {
		var game = sortedGames[i];
		var shortGameDesc = game.date + ' ' + game.time + ' vs. ' + game.opponentName;
		var deleteUndeleteImage = game.deleted ? 'undelete-entity.png' : 'delete-entity.png';
		var decorationClass = game.deleted ? 'deleted-entity' : '';
		html[html.length] = '<li class="' + decorationClass + '">';
		html[html.length] = '<img src="/images/' + deleteUndeleteImage + '" class="listImage gameDeleteButton" data-game="';
        html[html.length] =  game.gameId;
		html[html.length] = '" data-description="';
        html[html.length] = encodeURIComponent(shortGameDesc);       
		html[html.length] = '">';
		html[html.length] = '<span class="gameActionLink">';
		if (!game.deleted) {
			html[html.length] = '<a class="gameExportLink" href="javascript:void(0)" data-role="button" data-game="';
			html[html.length] =  game.gameId;
			html[html.length] = '">Export</a>';	
		}
		html[html.length] = '</span>';		
		html[html.length] = '<span class="gameActionLink">';
		if (!game.deleted) {
			html[html.length] = '<a class="gamePreviousVersionLink" href="javascript:void(0)" data-role="button" data-game="';
			html[html.length] =  game.gameId;
			html[html.length] = '">Versions</a>';	
		}
		html[html.length] = '</span>';				
		html[html.length] = '<span class="game-date">';
		html[html.length] = game.date;
		html[html.length] = '&nbsp;&nbsp;';
		html[html.length] = game.time;
		html[html.length] = '</span>&nbsp;&nbsp;';		
		html[html.length] = '<span class="opponent">vs. ';
		html[html.length] = game.opponentName;
		html[html.length] = '</span>';
		html[html.length] = '<span class="tournament">';
		html[html.length] = isNullOrEmpty(game.tournamentName) ?  '&nbsp;&nbsp;&nbsp;' : '&nbsp;&nbsp;at ' + game.tournamentName;
		html[html.length] = '</span>&nbsp;&nbsp;';		
		html[html.length] = '<span class="score '; 
		html[html.length] = game.ours > game.theirs ? 'ourlead' : game.theirs > game.ours ? 'theirlead' : ''; 
		html[html.length] = '">';
		html[html.length] = game.ours;
		html[html.length] = '-';
		html[html.length] = game.theirs;
		html[html.length] = '</span>';
		html[html.length] = '</li>';
	}
	var gamesTitle = (sortedGames.length > 0 ? ' Games:' : ' (no games for this team)');
	$('.gamesTitle').html(gamesTitle);
	var $websiteLink = $('.teamWebsite');
	$websiteLink.attr('href', $websiteLink.attr('href').replace('{TEAMID}', Ultimate.teamId));
	$("#games").empty().append(html.join('')).listview("refresh");
	$(".gameExportLink").on('click', function() {
		var gameId = $(this).data('game');
		location.href = urlForGameExportFileDownload(Ultimate.teamId,gameId);
	});
	$(".gamePreviousVersionLink").on('click', function() {
		Ultimate.gameVersions = [];
		var gameId = $(this).data('game');
		Ultimate.gameId = gameId;
		retrieveGameVersions(Ultimate.teamId, gameId, function(versions) {
			Ultimate.gameVersions.other = _.filter(versions, function(versionInfo) { 
				return !versionInfo.currentVersion; 
			});
			Ultimate.gameVersions.current = _.find(versions, function(versionInfo) {
				  return versionInfo.currentVersion;
			});
			if (Ultimate.gameVersions.other.length == 0) {
				alert('No previous versions for this game');
			} else {
				$.mobile.changePage('#gameVersionsDialog', {transition: 'pop', role: 'dialog'}); 
			}
		},handleRestError);
	});
}

function handleRestError(jqXHR, textStatus, errorThrown) {
	if (jqXHR.status == 401) {
		location.href = Ultimate.logonUrl;
	} else {
		throw errorDescription(jqXHR, textStatus, errorThrown);
	}
}

function handleSetPasswordClicked() {
	$.mobile.changePage('#teamPasswordDialog', {transition: 'pop', role: 'dialog'}); 
}

function handleImportGameClicked() {
	$.mobile.changePage('#importGameDialog', {transition: 'pop', role: 'dialog'}); 
}

function submitPassword(teamId, newPwd) {
	savePassword(teamId, newPwd, function() {
		resetCacheBuster();
		$.mobile.changePage('#teamsettingspage?team='+teamId, {transition: 'pop'});
		$(".teamPassword").html(newPwd);
	}, function() {
		$('#passwordSaveErrorMessage').html("Error saving password");
	});
}

function createPlayerListHtml(team) {
	if (Ultimate.playersTemplate == null) {
		Ultimate.playersTemplate = Handlebars.compile($("#playersListTemplate").html());
	}
	return Ultimate.playersTemplate(team);
}

function createMoveToPlayerListHtml(team) {
	if (Ultimate.moveToPlayersTemplate == null) {
		Ultimate.moveToPlayersTemplate = Handlebars.compile($("#moveToPlayerListTemplate").html());
	}
	return Ultimate.moveToPlayersTemplate(team);
}

function createGameVersionsListHtml(game) {
	if (Ultimate.gameVersionsTemplate == null) {
		Ultimate.gameVersionsTemplate = Handlebars.compile($("#gameVersionsListTemplate").html());
	}
	return Ultimate.gameVersionsTemplate(game);
}

function registerTeamPageRadioButtonHandler(page) {
	$('.team-view-choice-selector-' + page + ' input').prop('checked', false).checkboxradio("refresh");
	$('#team-view-choice-' + page + '-' + page).prop('checked', true).checkboxradio("refresh");
	$('.team-view-choice-selector-' + page + ' input').unbind('click').on('click', function() {
		var teamPageUrl = $('.team-view-choice-selector-' + page + ' input:checked').attr('value');
		teamPageUrl = '#' + teamPageUrl + '?team=' + Ultimate.teamId;
		$.mobile.changePage(teamPageUrl);
	});
}

function configurePlayerMoveDialogForDelete(player) {
	$('#player-change-dialog-title').html("Delete Player");
	$('#player-change-dialog-action-description').html("Delete");
	$('#player-change-dialog-instructions').html("When you delete this player the events associated with him/her must be moved to " +
			"another player (or Anonymous).  Choose the other player to whom the events should be moved and then click Delete.");
	$('#player-change-dialog-target-select-label').html("Select player to receive deleted player's events: ");
	$('#player-change-dialog-doit-button .ui-btn-text').html("Delete");
	$('#player-change-dialog-instructions').show();
	$('#player-change-dialog-target-select').show();
	$('#player-change-dialog-player-new-name').hide();
}

function configurePlayerMoveDialogForMerge(player) {
	$('#player-change-dialog-title').html("Merge Player");
	$('#player-change-dialog-action-description').html("Merge player data from");
	$('#player-change-dialog-instructions').html('You are choosing to move all of ' + player + '&apos;s data to another player. ' +
			player + ' will be deleted when complete.  Choose the other player to whom the data should be moved and then click Merge.');
	$('#player-change-dialog-target-select-label').html('Select player to receive ' + player + '&apos;s data: ');
	$('#player-change-dialog-doit-button .ui-btn-text').html("Merge");
	$('#player-change-dialog-instructions').show();
	$('#player-change-dialog-target-select').show();
	$('#player-change-dialog-player-new-name').hide();
}

function configurePlayerMoveDialogForRename(playerName) {
	var player = playerNamed(playerName);
	$('#player-change-dialog-title').html("Rename Player");
	$('#player-change-dialog-action-description').html("Rename");
	$('#player-change-dialog-doit-button .ui-btn-text').html("Rename");
	$('#player-change-dialog-player-new-nickname-field').val(player.name);
	$('#player-change-dialog-player-new-displayfirstname-field').val(player.firstName == null ? "" : player.firstName);
	$('#player-change-dialog-player-new-displaylastname-field').val(player.lastName == null ? "" : player.lastName);
	$('#player-change-dialog-instructions').hide();
	$('#player-change-dialog-target-select').hide();
	$('#player-change-dialog-player-new-name').show();
}

function playerNamed(playerName) {
	var players = Ultimate.team.players;
	if (players) {
		for (var i = 0; i < players.length; i++) {
			var player = players[i];
			if (player.name == playerName) {
				return player;
			}
		}
	} 
	return null;
}

// always returns a valid string
function trimString(s) {
	if (s == null) {
		return '';
	}
	return jQuery.trim(s);
}

function getTeam(cloudId) {
	for (var i = 0; i < Ultimate.teams.length; i++) {
		var team = Ultimate.teams[i];
		if (team.cloudId == cloudId) {
			return team;
		}
	}
	return null;
}

function getGame(gameId) {
	for (var i = 0; i < Ultimate.games.length; i++) {
		var game = Ultimate.games[i];
		if (game.gameId == gameId) {
			return game;
		}
	}
	return null;
}