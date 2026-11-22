const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '../windows/habits-dashboard.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../windows/css/habits-dashboard.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../windows/js/habits-dashboard.js'), 'utf8');

// 1. Verify HUD elements
assert(html.includes('id="dashQuickHud"'), 'HTML must include #dashQuickHud');
assert(html.includes('id="hudTodayVal"'), 'HTML must include #hudTodayVal');
assert(html.includes('id="hudStreakVal"'), 'HTML must include #hudStreakVal');
assert(html.includes('id="hudConsistencyVal"'), 'HTML must include #hudConsistencyVal');
assert(html.includes('id="hudActiveCount"'), 'HTML must include #hudActiveCount');
assert(css.includes('.dash-quick-hud'), 'CSS must include .dash-quick-hud');
assert(js.includes('updateQuickStatsHud'), 'JS must include updateQuickStatsHud()');

// 2. Verify View Switcher & Multiple View Modes
assert(html.includes('id="matrixViewSwitcher"'), 'HTML must include #matrixViewSwitcher');
assert(html.includes('id="viewModeWeekly"'), 'HTML must include #viewModeWeekly');
assert(html.includes('id="viewModeCompact"'), 'HTML must include #viewModeCompact');
assert(html.includes('id="viewModeCards"'), 'HTML must include #viewModeCards');
assert(html.includes('id="viewModeTable"'), 'HTML must include #viewModeTable');
assert(html.includes('id="weeklyGridContainer"'), 'HTML must include #weeklyGridContainer');
assert(html.includes('id="compactGridContainer"'), 'HTML must include #compactGridContainer');
assert(html.includes('id="cardsGridContainer"'), 'HTML must include #cardsGridContainer');
assert(html.includes('id="bujoTable"'), 'HTML must preserve #bujoTable');

// 3. Verify Search & Language Switcher
assert(html.includes('id="matrixSearchInput"'), 'HTML must include #matrixSearchInput');
assert(html.includes('id="btnHeaderLang"'), 'HTML must include #btnHeaderLang');
assert(html.includes('id="headerLangLabel"'), 'HTML must include #headerLangLabel');

// 4. Verify Weekly Navigation
assert(html.includes('id="btnPrevWeek"'), 'HTML must include #btnPrevWeek');
assert(html.includes('id="btnNextWeek"'), 'HTML must include #btnNextWeek');
assert(html.includes('id="weekTitleBadge"'), 'HTML must include #weekTitleBadge');

// 5. Verify CSS classes
assert(css.includes('.weekly-table'), 'CSS must style .weekly-table');
assert(css.includes('.weekly-btn'), 'CSS must style .weekly-btn');
assert(css.includes('.compact-habit-row'), 'CSS must style .compact-habit-row');
assert(css.includes('.habit-cards-grid'), 'CSS must style .habit-cards-grid');
assert(css.includes('.dash-accordion-btn'), 'CSS must style .dash-accordion-btn');

// 6. Verify JS implementations
assert(js.includes('renderWeeklyGrid'), 'JS must implement renderWeeklyGrid()');
assert(js.includes('renderCompactGrid'), 'JS must implement renderCompactGrid()');
assert(js.includes('renderCardsGrid'), 'JS must implement renderCardsGrid()');
assert(js.includes('btnHeaderLang'), 'JS must wire btnHeaderLang');
assert(js.includes('btnToggleHeatmap'), 'JS must wire btnToggleHeatmap');

console.log('🎉 ALL DASHBOARD UI MODERNIZATION TESTS PASSED 100%!');
