// const userIdKey = 'custom_user_id'
// let idKey = Object.keys(localStorage)
//   .filter((el) => el.includes(userIdKey))
//   .pop()

// chrome.runtime.sendMessage({
//   id: localStorage[idKey], //get from tab's local storage
// })

const defaults = {
  title: 'Cambly Session',
  url: 'https://www.cambly.com',
}

function formatDate(timestamp) {
  return (new Date(timestamp).toISOString().split('.')[0] + 'Z').replace(/-|:/g, '')
}

function createICSFromEvents(events) {
  let icsFormat = ''
  icsFormat += 'BEGIN:VCALENDAR\r\n'
  icsFormat += 'VERSION:2.0\r\n'
  icsFormat += 'CALSCALE:GREGORIAN\r\n'
  events.forEach((event) => {
    icsFormat += formatEvent(event)
  })
  icsFormat += 'END:VCALENDAR\r\n'
  return icsFormat
}

function formatEvent(ev) {
  let event = Object.assign({}, defaults, ev)
  let title = event.title,
    start = event.start,
    duration = event.duration,
    end = event.end,
    url = event.url

  let icsFormat = ''
  icsFormat += 'BEGIN:VEVENT\r\n'
  icsFormat += `SUMMARY:${title}\r\n`
  icsFormat += `DTSTART:${formatDate(start)}\r\n`

  if (duration) {
    icsFormat += `DURATION:${formatDuration(duration)}\r\n`
  }

  if (end) {
    icsFormat += `DTEND:${formatDate(end)}\r\n`
  }

  if (url) {
    icsFormat += `URL:${url}\r\n`
  }

  icsFormat += 'END:VEVENT\r\n'

  return icsFormat
}

const event1 = {
  start: 1643632200000,
  end: 1643633100000,
}

const event2 = {
  start: 1643814000000,
  end: 1643814900000,
}

// let finalEvent1 = formatEvent(event1)
// let finalEvent2 = formatEvent(event2)
// console.log(formatEvent(event1))
// console.log(formatEvent(event2))
console.log(createICSFromEvents([event1, event2]))
// function formatFile(event) {
//   var title = event.title,
//     start = event.start,
//     duration = event.duration,
//     end = event.end,
//     description = event.description,
//     url = event.url,
//     location = event.location,
//     status = event.status
//   var icsFormat = ''
//   icsFormat += 'BEGIN:VCALENDAR\r\n'
//   icsFormat += 'VERSION:2.0\r\n'
//   icsFormat += 'CALSCALE:GREGORIAN\r\n'
//   icsFormat += 'BEGIN:VEVENT\r\n'
//   icsFormat += 'UID:'.concat(uid, '\r\n')
//   icsFormat += (0, _utils.foldLine)('SUMMARY:'.concat(title ? (0, _utils.setSummary)(title) : title)) + '\r\n'
//   icsFormat += 'DTSTAMP:'.concat(timestamp, '\r\n') // All day events like anniversaries must be specified as VALUE type DATE

//   icsFormat += 'DTSTART'
//     .concat(start && start.length == 3 ? ';VALUE=DATE' : '', ':')
//     .concat((0, _utils.formatDate)(start, startOutputType || startType, startInputType), '\r\n') // End is not required for all day events on single days (like anniversaries)

//   if (
//     !end ||
//     end.length !== 3 ||
//     start.length !== end.length ||
//     start.some(function (val, i) {
//       return val !== end[i]
//     })
//   ) {
//     if (end) {
//       icsFormat += 'DTEND'
//         .concat(end.length === 3 ? ';VALUE=DATE' : '', ':')
//         .concat((0, _utils.formatDate)(end, endOutputType || startOutputType || startType, endInputType || startInputType), '\r\n')
//     }
//   }

//   icsFormat += description ? (0, _utils.foldLine)('DESCRIPTION:'.concat((0, _utils.setDescription)(description))) + '\r\n' : ''
//   icsFormat += url ? (0, _utils.foldLine)('URL:'.concat(url)) + '\r\n' : ''
//   icsFormat += location ? (0, _utils.foldLine)('LOCATION:'.concat((0, _utils.setLocation)(location))) + '\r\n' : ''
//   icsFormat += status ? (0, _utils.foldLine)('STATUS:'.concat(status)) + '\r\n' : ''
//   icsFormat += duration ? 'DURATION:'.concat((0, _utils.formatDuration)(duration), '\r\n') : ''
//   icsFormat += 'END:VEVENT\r\n'
//   icsFormat += 'END:VCALENDAR\r\n'
//   return icsFormat
// }
