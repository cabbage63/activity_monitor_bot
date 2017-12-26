# Activity Monitor Bot

This is a slackbot to record and show your activity time.

## usage

- Spread Sheet
    - create a new spread sheet.
    - share with an edit right.
    - copy share url and set it GAS constant `SPREAD_SHEET_URL`.
    - (This is used as a database)
- Slack
    - make Outgoing Webhooks
        - set Trigger words -- 
        `start_activity:,finish_activity:,delete_activity:,show_sum:,show_chart:,help:,show_chart_week,show_chart_mont`
        - set URL to GAS application url
        - copy Token and set GAS constant `VERIFY_TOKEN`
    - create slack api
        - https://get.slack.help/hc/en-us/articles/215770388-Create-and-regenerate-API-tokens
        - copy a Token and set GAS constant `SLACK_ACCESS_TOKEN`
- GAS
    - Open File -> Project Property.
    - Then, define constant shown below
        - SPREAD_SHEET_URL
        - VERIFY_TOKEN
        - BOT_ICON_URL
        - SLACK_ACCESS_TOKEN
    - copy src/code.js and paste to code.gs
    - Publish -> publish as a web application
        - update project version.
        - set Everyone "Who has access to the app:"

## Command Reference

### start_activity: <activity tag>
-- start activity

### finish_activity:
-- finish running activity

### delete_activity:
-- delete running activity(not implemented)

### show_sum: <begin date> <end date> <activity tag(optional)>
-- show activity time designated time span and a kind of activity.

### show_chart: <begin date> <end date> <activity tag(optional)>
-- show a chart which expresses activity time for the time span.

### show_chart: <time_span> <activity tag(optional)>
-- week or month is allowed for <time_span>.
