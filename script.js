const cityInput = document.getElementById('city')
const suggestions = document.getElementById('suggestions')

const cityName = document.getElementById('cityName')
const temp = document.getElementById('temp')
const humidity = document.getElementById('humidity')
const wind = document.getElementById('wind')
const pressure = document.getElementById('pressure')
const feelsLike = document.getElementById('feelsLike')
const condition = document.getElementById('condition')
const icon = document.getElementById('icon')
const lastUpdate = document.getElementById('lastUpdate')
const forecast = document.getElementById('forecast')

// ===============================
// Load Default Weather
// ===============================

window.onload = () => {
  getWeather('Butwal')
}

// ===============================
// Search Icon
// ===============================

document.querySelector('.searchIcon').onclick = () => {
  getWeather()
  suggestions.innerHTML = ''
}

// ===============================
// Enter Key
// ===============================

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    getWeather()
    suggestions.innerHTML = ''
  }
})

// ===============================
// Get Weather
// ===============================

async function getWeather(defaultCity = 'Butwal') {
  const city = cityInput.value.trim() || defaultCity

  try {
    // Geocoding API
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    )

    const geo = await geoResponse.json()

    if (!geo.results || geo.results.length === 0) {
      alert('City not found')
      return
    }

    const { name, country, latitude, longitude } = geo.results[0]

    // Weather API
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code` +
        `&hourly=temperature_2m,weather_code` +
        `&timezone=auto`
    )

    const data = await weatherResponse.json()

    const c = data.current

    // Update Weather Information
    cityName.textContent = `${name}, ${country}`

    temp.textContent = `${Math.round(c.temperature_2m)}°C`

    humidity.textContent = `${c.relative_humidity_2m}%`

    wind.textContent = `${Math.round(c.wind_speed_10m)} km/h`

    pressure.textContent = `${Math.round(c.surface_pressure)} hPa`

    feelsLike.textContent = `${Math.round(c.apparent_temperature)}°C`

    condition.textContent = getWeatherText(c.weather_code)

    icon.src = getWeatherIcon(c.weather_code)

    icon.alt = getWeatherText(c.weather_code)

    lastUpdate.innerHTML = `Last Updated: ${new Date().toLocaleString()}<br>
  &copy; 2026 Weather Broadcast. All rights reserved.`

    // Load Forecast
    loadForecast(data)
  } catch (error) {
    console.error('Weather Error:', error)

    alert('Unable to fetch weather data')
  }
}

// ===============================
// Load Forecast
// ===============================

function loadForecast(data) {
  forecast.innerHTML = ''

  const currentHour = new Date().getHours()

  for (let i = 0; i < 5; i++) {
    const index = currentHour + i

    if (!data.hourly.temperature_2m[index] || data.hourly.weather_code[index] === undefined) {
      continue
    }

    const temperature = Math.round(data.hourly.temperature_2m[index])

    const weatherCode = data.hourly.weather_code[index]

    forecast.innerHTML += `
      <div class="forecast-card">

        <p>${formatHour(index % 24)}</p>

        <img
          src="${getWeatherIcon(weatherCode)}"
          width="32"
          height="32"
          alt="${getWeatherText(weatherCode)}"
        >

        <h4>${temperature}°C</h4>

      </div>
    `
  }
}

// ===============================
// City Search Suggestions
// ===============================

cityInput.addEventListener('input', async () => {
  const value = cityInput.value.trim()

  if (value.length < 2) {
    suggestions.innerHTML = ''

    return
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=5&language=en&format=json`
    )

    const data = await response.json()

    suggestions.innerHTML = ''

    if (!data.results) {
      return
    }

    data.results.forEach((city) => {
      const item = document.createElement('div')

      item.className = 'item'

      item.textContent = `${city.name}, ${city.country}`

      item.addEventListener('click', () => {
        selectCity(city.name)
      })

      suggestions.appendChild(item)
    })
  } catch (error) {
    console.error('Suggestion Error:', error)
  }
})

// ===============================
// Select City
// ===============================

function selectCity(city) {
  cityInput.value = city

  suggestions.innerHTML = ''

  getWeather(city)
}

// ===============================
// Format Hour
// ===============================

function formatHour(hour) {
  return `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`
}

// ===============================
// Weather Text
// ===============================

function getWeatherText(code) {
  return (
    {
      0: 'Clear Sky',

      1: 'Mainly Clear',

      2: 'Partly Cloudy',

      3: 'Cloudy',

      45: 'Fog',

      48: 'Fog',

      51: 'Light Drizzle',

      53: 'Drizzle',

      55: 'Heavy Drizzle',

      56: 'Freezing Drizzle',

      57: 'Heavy Freezing Drizzle',

      61: 'Light Rain',

      63: 'Rain',

      65: 'Heavy Rain',

      66: 'Freezing Rain',

      67: 'Heavy Freezing Rain',

      71: 'Light Snow',

      73: 'Snow',

      75: 'Heavy Snow',

      77: 'Snow Grains',

      80: 'Rain Showers',

      81: 'Heavy Rain Showers',

      82: 'Violent Rain Showers',

      85: 'Snow Showers',

      86: 'Heavy Snow Showers',

      95: 'Thunderstorm',

      96: 'Thunderstorm with Hail',

      99: 'Thunderstorm with Heavy Hail',
    }[code] || 'Unknown'
  )
}

// ===============================
// SVG Weather Icons
// ===============================

function getWeatherIcon(code) {
  // Clear Sky
  if (code === 0) {
    return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/2600.svg'
  }

  // Mainly Clear / Partly Cloudy / Cloudy
  if (code >= 1 && code <= 3) {
    return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f324.svg'
  }

  // Fog
  if (code === 45 || code === 48) {
    return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f32b.svg'
  }

  // Drizzle / Rain
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f327.svg'
  }

  // Snow
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/2744.svg'
  }

  // Thunderstorm
  if (code >= 95) {
    return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/26c8.svg'
  }

  // Default
  return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f324.svg'
}
