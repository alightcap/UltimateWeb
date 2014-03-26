/* global _ */

'use strict';

angular.module('newBetaApp')
  .factory('playerStats', ['$q', 'allGames', 'team',function($q, allGames, team) {

    var includedGames;
    var playerStats;
    var basicStatTypes = ['catches', 'drops', 'throwaways', 'stalls', 'penalized', 'ds', 'iBPulls', 'oBPulls', 'goals', 'callahans', 'thrownCallahans', 'assists', 'passesDropped', 'completions', 'timePlayed', 'pullHangtime', 'gamesPlayed', 'dPoints', 'oPoints', 'oPlusMinus', 'dPlusMinus','hungPulls'];


    function recordEvent(event, players) {
      var receiver = event.receiver;
      var passer = event.passer;
      var defender = event.defender;
      switch (event.action) {
      case 'Catch':
        players[receiver] && players[receiver].stats.catches++;
        players[passer] && players[passer].stats.completions++;
        break;
      case 'Drop':
        players[receiver] && players[receiver].stats.drops++;
        players[receiver] && players[receiver].stats.oPlusMinus--;
        players[passer] && players[passer].stats.passesDropped++;
        break;
      case 'Throwaway':
        players[passer] && players[passer].stats.throwaways++;
        players[passer] && players[passer].stats.oPlusMinus--;
        break;
      case 'Stall':
        players[passer] && players[passer].stats.stalls++;
        players[passer] && players[passer].stats.oPlusMinus--;
        break;
      case 'MiscPenalty':
        if (event.type === 'Offense'){
          players[passer] && players[passer].stats.penalized++;
        } else {
          players[defender] && players[defender].stats.penalized++;
        }
        break;
      case 'D':
        players[defender] && players[defender].stats.ds++;
        players[defender] && players[defender].stats.dPlusMinus++;
        break;
      case 'Pull':
        if (players[defender]){
          players[defender].stats.iBPulls++;
          if (event.details && event.details.hangtime) {
            players[defender].stats.hungPulls++;
            players[defender].stats.pullHangtime += (event.details.hangtime / 1000);
          }
        }
        break;
      case 'PullOb':
        if (players[defender]){
          players[defender].stats.oBPulls++;
        }
        break;
      case 'Goal':
        if (players[passer]){
          players[passer].stats.oPlusMinus++;
          players[passer].stats.completions++;
          players[passer].stats.assists++;
        }
        if (players[receiver]){
          players[receiver].stats.oPlusMinus++;
          players[receiver].stats.catches++;
          players[receiver].stats.goals++;
        }
        break;
      case 'Callahan':
        if (players[defender]){
          players[defender].stats.catches++;
          players[defender].stats.dPlusMinus++;
          players[defender].stats.oPlusMinus++;
          players[defender].stats.goals++;
          players[defender].stats.ds++;
          players[defender].stats.callahans++;
        }
        break;
      default:
        if (['EndOfFirstQuarter', 'Halftime', 'EndOfThirdQuarter', 'EndOfFourthQuarter', 'GameOver'].indexOf(event.action) < 0){
          throw new Error(event.action, ' is not a registered event.');
        }
      }
    }

    var derive = function() {
      var players = {};
      _(team.players).pluck('name').each(function(name){
        players[name] = {};
        players[name].stats = {};
        _.each(basicStatTypes, function(type){
          players[name].stats[type] = 0;
        });
      });

      _.each(includedGames, function(ref) {
        var playedInGame = {};
        _.each(allGames[ref.gameId].points, function(point) {
          _.each(point.line, function(name){
            if (players[name]) {
              if (!playedInGame[name]){
                players[name].stats.gamesPlayed++;
                playedInGame[name] = true;
              }
              point.summary.lineType === 'D' ? players[name].stats.dPoints++ : players[name].stats.oPoints++;
              players[name].stats.timePlayed += point.endSeconds - point.startSeconds;
            }
          });
          _.each(point.events, function(event){
            recordEvent(event, players);
          });
        });
      });
      _.each(players, function(player){
        extendPercentageStats(player.stats);
      });
      _.each(players, function(player, name){
        player.name = name;
      });
      _.each(players, function(player){
        extendAestheticStats(player.stats);
      });
      playerStats = players;
      return players;
    };
    function statSum(stats, types, negative){
      return _.reduce(types, function(memo,type){
        memo = negative ? memo - stats[type] : memo + stats[type];
        return memo;
      }, 0);
    }
    function extendAestheticStats(stats){
      stats.pointsPlayed = statSum(stats, ['oPoints', 'dPoints']);
      stats.pulls = statSum(stats, ['oBPulls', 'iBPulls']);
      stats.touches = statSum(stats, ['completions', 'throwaways', 'goals','passesDropped']);
      stats.plusMinus = statSum(stats, ['oPlusMinus', 'dPlusMinus']);
      stats.timePlayedMinutes = Math.round(stats.timePlayed / 60);
      stats.averagePullHangtime = stats.pullHangtime  / stats.hungPulls;
      _.each(['goals', 'assists', 'ds',  'throwaways',  'drops'], function(name){
        stats['pp' + name[0].toUpperCase() + name.slice(1)] = stats.pointsPlayed ? (stats[name] / stats.pointsPlayed) : 0;
      });
    }
    function extendPercentageStats(stats){
      _.each([
          ['catchingPercentage', 'catches', 'drops'],
          ['passingPercentage', 'completions', 'throwaways'],
          ['iBPullingPercentage', 'iBPulls', 'oBPulls']
        ], function(average){
          stats[average[0]] = Math.round(stats[average[1]] / (stats[average[1]] + stats[average[2]]) * 100);
        }
      );
    }
    function getLeaders(types){
      var leaders = {};
      _.each(types, function(type){
        leaders[type] = _.max(playerStats,function(player){
          return player.stats[type];
        });
      });
      return leaders;
    }
    function getTotals(){
      var totals = {};
      _.each(basicStatTypes, function(type){
        totals[type] = _.reduce(playerStats,getSumFunction(type));
      });
      extendPercentageStats(totals);
      extendAestheticStats(totals);
      return totals;
    }
    function getAverages(){
      var averages = {};
      var statTypes = _.keys(_.sample(playerStats).stats);
      _(statTypes).each(function(type){
        averages[type] = _.reduce(playerStats, getSumFunction(type)).valueOf() / _.keys(playerStats).length;
      });
      return averages;
    }
    function getSumFunction(type){
      return function(memo, player){
        if (_.isNumber(memo)) {
          return player.stats[type] ? memo + player.stats[type] : memo;
        } else {
          return player.stats[type];
        }
      };
    }

    //promise land
    $q.all([allGames, team]).then(function(responses){
      allGames = responses[0];
      team = responses[1];
      deferred.resolve({
        getLeaders: getLeaders,
        getTotals: getTotals,
        getAverages: getAverages,
        getAll: function(){return playerStats},
        getForPlayer: function(playerName){
          return playerStats[playerName];
        },
        setGames: function(games){
          includedGames = games;
          derive();
        }
      });
    });
    var deferred = $q.defer();
    return deferred.promise;
  }]);

// Assists Passes  Throwaways  Stalls  Percent Completed
// Goals Catches Touches Drops Percent Caught
// Games Played  PointsPlayed  Minutes Played  Offensive Points  Defensive Points
// D's Callahans Pulls Average Hang Time Out of Bounds Pulls
// Goals Assists Ds  Throwaways  Drops

