const form = document.getElementById('control-row')
const reservationList = document.getElementById('reservations')
const message = document.getElementById('message')
const downloadForm = document.createElement('form')
const hostUrl = 'www.cambly.com'
const reservationUrl = 'https://www.cambly.com/api/reservations?language=en&cancelled=false&scrub=true'
const scheduleUrl = 'https://www.cambly.com/en/student/schedule/'
const defaults = {
  title: 'Cambly Lesson',
  url: 'https://www.cambly.com',
}

form.addEventListener('submit', handleFormSubmit)

async function handleFormSubmit(event) {
  event.preventDefault()

  clearMessage()

  try {
    let session = await getDomainCookies(hostUrl)
    let sessionId = session.filter((el) => el.name === 'session')[0].value
    chrome.storage.sync.get(['student_id'], async function (storage) {
      const url = reservationUrl + `&studentId=${storage.student_id}&start=${new Date().getTime()}`
      const opts = {
        headers: {
          cookie: `session=${sessionId}`,
        },
      }

      const res = await fetch(url, opts)
      const { result } = await res.json()
      const transformed = transformCalendarData(result)
      const file = createICSFromEvents(transformed)
      showReservations(transformed)
      createDownload(file)
    })
  } catch (error) {
    setMessage(error)
  }
}

async function getDomainCookies(domain) {
  let cookies
  try {
    cookies = await chrome.cookies.getAll({ domain })

    if (cookies.length === 0) {
      return 'No cookies found'
    }
  } catch (error) {
    return `Unexpected error: ${error.message}`
  }

  return JSON.parse(JSON.stringify(cookies))
}

function showReservations(results) {
  results.map((res) => {
    reservationList.innerHTML += `<li>Start time: ${epochToReadable(res.start)}, Duration: ${res.duration} </li>`
  })
}

function createDownload(file) {
  let datauri = `data:text/plain;charset=utf-8,${file}`
  var element = document.createElement('a')
  element.setAttribute('href', datauri)
  element.setAttribute('download', 'cambly_calendar.ics')
  element.innerText = 'Download Reservations!'
  document.body.appendChild(element)
}

function epochToReadable(epochTime) {
  return new Date(epochTime).toLocaleString()
}

function setMessage(str) {
  message.textContent = str
  message.hidden = false
}

function clearMessage() {
  message.hidden = true
  message.textContent = ''
}

function transformCalendarData(arr) {
  const transformed = []
  arr.forEach((el, index) => {
    const obj = { start: el.startTime.$date }
    if (el.endTime.$date) obj.end = el.endTime.$date
    if (el.minutes) obj.duration = el.minutes
    if (el._id.$oid) obj.url = scheduleUrl + el._id.$oid
    transformed[index] = obj
  })
  return transformed
}

function formatDate(timestamp) {
  return (new Date(timestamp).toISOString().split('.')[0] + 'Z').replace(/-|:/g, '')
}

function formatDuration(minutes) {
  return `PT${minutes}M`
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
  } else if (end) {
    icsFormat += `DTEND:${formatDate(end)}\r\n`
  }

  if (url) {
    icsFormat += `URL:${url}\r\n`
  }

  icsFormat += 'END:VEVENT\r\n'

  return icsFormat
}
