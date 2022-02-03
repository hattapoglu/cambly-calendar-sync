const div = document.getElementById('reservation')
const reservationList = document.getElementById('list')
const message = document.getElementById('message')
const getButton = document.getElementById('get')
const downloadButton = document.getElementById('download')

const hostUrl = 'www.cambly.com'
const reservationUrl = 'https://www.cambly.com/api/reservations?language=en&cancelled=false&scrub=true'
const scheduleUrl = 'https://www.cambly.com/en/student/schedule/'

const fetchOptions = {
  headers: {
    cookie: {},
  },
}

const defaults = {
  title: 'Cambly Lesson',
  url: hostUrl,
}

const errors = {
  authentication: 'Please log in to Cambly and try again.',
  storage: 'Student id could not be found.',
  session: `Please go to ${hostUrl}, log in and click the button again.`,
}

getButton.addEventListener('click', getReservations)

function setMessage(str) {
  message.textContent = str
  message.hidden = false
}

function clearMessage() {
  message.hidden = true
  message.textContent = ''
}

async function getReservations() {
  clearMessage()
  document.body.classList.remove('active')

  // const cookies = await getCookies(hostUrl)
  // const session = cookies.filter((el) => el.name === 'session')
  // if (!session.length) {
  //   setMessage(errors.authentication)
  //   throw new Error(errors.authentication)
  // }
  // console.log('is that even come to here???!')
  // const sessionId = session[0].value
  // fetchOptions.headers.cookie
  // fetchOptions.headers.cookie = `session=${sessionId}`
  const studentId = await getKeyFromStorage('student_id')
  fetch(`${reservationUrl}&studentId=${studentId}&start=${new Date().getTime()}`)
    .then(async (res) => {
      console.log(res, res.ok, res.status)
      const { result } = await res.json()
      const results = result.map((res) => transformCalendarData(res))
      setReservations(results)
      setDownload(results)
    })
    .catch((error) => {
      console.log(error.code, error.message)
    })
}

// async function getCookies(domain) {
//   try {
//     const cookies = await chrome.cookies.getAll({ domain })
//     if (!cookies.length) {
//       setMessage(errors.session)
//       throw new Error(errors.session)
//     }
//     return cookies
//   } catch (error) {
//     console.log(error.message)
//   }
// }

async function getKeyFromStorage(key) {
  try {
    let storage = await chrome.storage.sync.get([key])
    if (!storage[key]) {
      setMessage(errors.storage)
      throw new Error(errors.storage)
    }
    return storage[key]
  } catch (error) {
    console.log(error.message)
  }
}

function transformCalendarData(result) {
  return { start: result.startTime.$date, duration: result.minutes, id: result._id.$oid }
}

function setReservations(results) {
  reservationList.innerHTML = ''
  results.map((res) => {
    reservationList.innerHTML += `<li>${epochToReadable(res.start)}, Duration: ${res.duration} Minutes</li>`
  })
  document.body.classList.add('active')
}

function setDownload(results) {
  let file = createICS(results)
  let datauri = `data:text/plain;charset=utf-8,${file}`
  downloadButton.setAttribute('href', datauri)
}

function epochToReadable(epochTime) {
  return new Date(epochTime).toLocaleString().replace(/\//g, '.').replace(',', ' @')
}

function formatDate(timestamp) {
  return (new Date(timestamp).toISOString().split('.')[0] + 'Z').replace(/-|:/g, '')
}

function formatDuration(minutes) {
  return `PT${minutes}M`
}

function createICS(events) {
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
    url = event.url

  let icsFormat = ''
  icsFormat += 'BEGIN:VEVENT\r\n'
  icsFormat += `SUMMARY:${title}\r\n`
  icsFormat += `DTSTART:${formatDate(start)}\r\n`

  if (duration) {
    icsFormat += `DURATION:${formatDuration(duration)}\r\n`
  }

  if (url) {
    icsFormat += `URL:${url}\r\n`
  }

  icsFormat += 'END:VEVENT\r\n'

  return icsFormat
}
