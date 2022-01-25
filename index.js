import fetch from 'node-fetch'
import ics from 'ics'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const url = 'https://www.cambly.com/api/reservations?studentId=5c0e29c81d37eb0027d0bc32&language=en&cancelled=false&start=1643101411787'

const cookie = 'session=eyJ0b2tlbiI6InllaDdmMTNDbTZadlZvNThZcEM2K1lDY3B4amY2MktCIn0.Ye_YgQ.nOK8LUV2qv2h2pDX0Tz6E-0x3TM;'

const opts = {
  headers: {
    cookie: cookie,
  },
}

const fetchDataFromUrl = async (url) => {
  const response = await fetch(url, opts)
  return response.json()
}

const convertToICSFormat = (epoch) => {
  const temp = new Date(epoch).toLocaleString().split(',')
  const date = temp[0].split('/')
  const time = temp[1].split(':')
  const isPm = time[time.length - 1].slice(-2) === 'PM'
  const myDate = [date[2], date[0], date[1]]
  const myTime = [time[0], time[1]]
  const newDate = myDate.map((el) => Number(el))
  const newTime = myTime.map((el) => Number(el))
  isPm ? (newTime[0] += 12) : null
  return newDate.concat(newTime)
}

const createEventObject = (obj) => {
  return {
    start: obj.startTime['$date'],
    title: 'Cambly Session',
    duration: { minutes: 15 },
  }
}

const main = function () {
  fetchDataFromUrl(url).then(({ result }) => {
    result.map((reservation) => (reservation.startTime['$date'] = convertToICSFormat(reservation.startTime['$date'])))

    const events = result.map((res) => createEventObject(res))

    const { error, value } = ics.createEvents(events)

    if (error) {
      console.log(error)
      return
    }

    writeFileSync(`${__dirname}/event.ics`, value)
  })
}

main()
