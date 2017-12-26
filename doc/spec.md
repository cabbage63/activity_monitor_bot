- 同時並行で複数のタスクが走らないことを前提。startするのはタスクが閉じてから。
- startしていないのにendしようとすると警告「No activity is running.」
- endしていないのにstartしようとする場合「Running activity exists. Please finish activity by "/finish_activity" or delete runnning activity by "/delete_activity"」
- current rowはrunning activityまたは空白の行
- show_sum: 2017/11/20 2017/12/30 tag_name
  return ***day***min***sec
         and chart
  start < finish でないときは警告を出す。
  finishは+1日の0:00まで
