// ==UserScript==
// @name Trello coloured Scrum Kanban
// @namespace https://trello.com/
// @version 3.1
// @description Colour list for Scrum, referenced with Kanban Game - Optimized for performance
// @match https://trello.com/*
// @require http://code.jquery.com/jquery-latest.js
// @author       Michael Wan (Optimized version)
// @downloadURL https://update.greasyfork.org/scripts/37171/Trello%20coloured%20Scrum%20Kanban.user.js
// @updateURL https://update.greasyfork.org/scripts/37171/Trello%20coloured%20Scrum%20Kanban.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // Colors configuration
    const colors = {
        red: '#fccbc2',
        blue: '#9ec4ff',
        green: '#dbffd1',
        grey: '#c4c4c4',
        black: '#898989',
        white: '#fff',
        yellow: '#ffd800',
        lightyellow: '#fdffbf',
        darkred: '#ff6363',
        lightblue: '#dbf3ff',
        lightorange: '#ffd396',
        darkdarkred: '#c1150f',
        pink: '#fabaff',
        orange: '#ff8300'
    };

    // WIP limit configuration
    const WIP_LIMIT = 2;

    // Update intervals (in milliseconds)
    const UPDATE_INTERVAL = 2000;

    // Initialize when document is ready
    $(document).ready(function() {
        // Apply initial styles and set up periodic updates
        applyStyles();
        setInterval(applyStyles, UPDATE_INTERVAL);

        // Start WIP and list insight monitors
        updateWIP();
        setInterval(updateWIP, UPDATE_INTERVAL);

        updateListInsight();
        setInterval(updateListInsight, UPDATE_INTERVAL);
    });

    // Apply all styles to Trello elements
    function applyStyles() {
        // Color the lists based on header text
        $("h2:contains('Development')").css('color', colors.white).parents('.list').css('background', colors.blue);
        $("h2:contains('Testing')").css('color', colors.white).parents('.list').css('background', colors.green);
        $("h2:contains('Ready to Deploy')").css('color', colors.white).parents('.list').css('background', colors.grey);
        $("h2:contains('Deployed')").css('color', colors.white).parents('.list').css('background', colors.black);

        // Style cards with special markers
        $("a:contains('!')").parents("[data-testid='trello-card']").css({
            'border-color': colors.yellow,
            'border-style': 'solid',
            'border-width': '5px'
        });

        $("a:contains('!!')").parents("[data-testid='trello-card']").css({
            'border-color': colors.orange,
            'border-style': 'solid',
            'border-width': '5px'
        });

        $("a:contains('`')").parents("[data-testid='trello-card']").css({
            'border-color': colors.lightblue,
            'border-style': 'solid',
            'border-width': '5px'
        });

        // Apply background colors to special cards
        $("a:contains('[P]')").parents("[data-testid='trello-card']").css('background', colors.lightyellow);
        $("a:contains('[Parent]')").parents("[data-testid='trello-card']").css('background', colors.lightyellow);
        $("a:contains('Blocked')").parents("[data-testid='trello-card']").css('background', colors.pink);
        $("a:contains('[VIP]')").parents("[data-testid='trello-card']").css('background', colors.darkred);
        $("a:contains('[R]')").parents("[data-testid='trello-card']").css('background', '#eeffbf');
        $("a:contains('[INFO]')").parents("[data-testid='trello-card']").css('background', '#e0f8ff');

        // Show and style card IDs
        $(".card-short-id").append(" ").removeClass("hide").css('color', colors.lightorange);

        // Highlight cards without estimates
        $("a[class='trello-card-title js-card-name']").filter(function() {
            return !new RegExp("\\(\\d+\\)").test($(this).text());
        }).find(".card-short-id").css('color', colors.darkdarkred);
    }

    // Update Work In Progress information
    function updateWIP() {
        // Remove previous WIP display
        $("#actualWIP").remove();

        // Add new WIP display
        $(".board-header").after("<div id='actualWIP' style='color: white; padding: 5px; background: rgba(0,0,0,0.1);'>ActualWIP (excluded Blocked): </div>");

        // Get all members
        var allMember = $("div.list-wrapper")
            .find("img.member-avatar")
            .map(function() {
                return this.alt.replace(/\(.+\)/, "");
            })
            .toArray();

        // Create member map
        var finalMap = new Map();
        for (var i in allMember) {
            finalMap.set(allMember[i], 0);
        }

        // Find in-progress list
        var inProgressList = $('textarea:contains("In Progress")').closest("div.list-wrapper");

        // If In Progress list exists
        if (inProgressList.length > 0) {
            // Count normal assignments
            var normalMap = inProgressList
                .find("img.member-avatar")
                .map(function() {
                    return this.alt.replace(/\(.+\)/, "");
                })
                .toArray()
                .reduce((acc, val) => acc.set(val, 1 + (acc.get(val) || 0)), new Map());

            // Count blocked assignments
            var blockedMap = inProgressList
                .find("span[title='Blocked'], span[title='Keep Monitoring'], span[title='Pending for Desk Check'], span[title='[Parent]'], span[title='[P]']")
                .closest("a.list-card")
                .find("img.member-avatar")
                .map(function() {
                    return this.alt.replace(/\(.+\)/, "");
                })
                .toArray()
                .reduce((acc, val) => acc.set(val, 1 + (acc.get(val) || 0)), new Map());

            // Calculate final WIP for each member
            for (var [key, value] of finalMap.entries()) {
                var point = normalMap.get(key) === undefined ? 0 : normalMap.get(key);
                var blockedPoint = blockedMap.get(key) === undefined ? 0 : blockedMap.get(key);
                finalMap.set(key, point - blockedPoint);
            }

            // Display WIP information
            var wipOutput = [];
            finalMap.forEach(function(value, key) {
                if (value === 0 || value > WIP_LIMIT) {
                    wipOutput.push("<b style='color: yellow'>" + key + ": " + value + "</b>");
                } else {
                    wipOutput.push(key + ": " + value);
                }
            });

            $("#actualWIP").append(wipOutput.join(" , "));
        }
    }

    // Update list insights
    function updateListInsight() {
        // Remove previous insights
        $('p.StoryPtInsight').remove();

        // Process each list
        $('div.list-wrapper').each(function() {
            var listname = $(this).find('textarea.list-header-name').text();
            var listcardLength = $(this).find(".list-card").length;
            var listStoryPt = 0;
            var missedPtCardNumber = 0;

            // Calculate story points
            $(this).find(".list-card").find(".plugin-color-green,.plugin-color-lime,.plugin-color-yellow,.plugin-color-red").find(".badge-text").each(function() {
                var storyPtStr = $(this).text();
                var storyPt = parseFloat(storyPtStr) || 0;
                missedPtCardNumber += storyPtStr == "Unestimated" ? 1 : 0;
                listStoryPt += storyPt;
            });

            // Create insight HTML
            var appendHTML = "<p class='StoryPtInsight'><b style='color: green'>#Cards:" + listcardLength + "</b> <b style='color: blue'>#StoryPt:" + listStoryPt + "</b>";

            if (missedPtCardNumber > 0) {
                appendHTML += " <b style='color: red'>#Miss:" + missedPtCardNumber + "</b>";
            }

            appendHTML += "</p>";

            // Add insight to list header
            $(this).find('textarea.list-header-name').after(appendHTML);
        });
    }
})();
