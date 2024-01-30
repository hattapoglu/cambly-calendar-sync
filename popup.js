const reservationList = document.getElementById('list')
const message = document.getElementById('message')
const loading = document.getElementById('loading')
const getButton = document.getElementById('get')
const downloadButton = document.getElementById('download')

const reservationUrl = 'https://www.cambly.com/api/reservations?language=en&cancelled=false&scrub=true'
const scheduleUrl = 'https://www.cambly.com/en/student/schedule/'

const defaults = {
  title: 'Cambly Lesson',
  url: 'www.cambly.com',
}

const errors = {
  authentication: 'Please log in to Cambly and try again.',
  storage: 'Please make sure that you are logged in to Cambly and refresh the page before trying again.',
  any: 'You do not have any upcoming reservation yet.',
}

getButton.addEventListener('click', getReservations)

function setErrorMessage(str) {
  setLoading(false)
  message.textContent = str
  message.hidden = false
}

function clearErrorMessage() {
  message.hidden = true
  message.textContent = ''
}

function setLoading(bool) {
  loading.hidden = !bool
}

async function getReservations() {
  clearErrorMessage()
  setLoading(true)
  document.body.classList.remove('active')

  const studentId = await getKeyFromStorage('student_id')

  if (!studentId) {
    setErrorMessage(errors.storage)
    return
  }

  fetch(`${reservationUrl}&studentId=${studentId}&start=${new Date().getTime()}`)
    .then(async (res) => {
      if (res.status === 401) {
        setErrorMessage(errors.authentication)
        throw new Error(errors.authentication)
      }
      const { result } = await res.json()
      if (!result.length) {
        setErrorMessage(errors.any)
        throw new Error(errors.any)
      }
      const results = result.map((res) => transformCalendarData(res))
      setLoading(false)
      setReservations(results)
      setDownload(results)
    })
    .catch((error) => {
      setErrorMessage(error.message)
    })
}

async function getKeyFromStorage(key) {
  try {
    let storage = await chrome.storage.sync.get([key])
    if (!storage[key]) {
      setErrorMessage(errors.storage)
      throw new Error(errors.storage)
    }
    return storage[key]
  } catch (error) {
    setErrorMessage(error.message)
  }
}

function transformCalendarData(result) {
  return { start: result.startTime.$date, duration: result.minutes, scheduleId: result._id?.$oid }
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
    url = event.scheduleId ? scheduleUrl + event.scheduleId : event.url

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
