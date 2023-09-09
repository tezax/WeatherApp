import React, { useState, useEffect } from "react";
import "./App.css";

function WeatherCard({ city, temperatureUnit, convertTemperature, onDelete }) {
  return (
    <div className="card">
      <div className="container">
        <div className="cloud front">
          <span className="left-front"></span>
          <span className="right-front"></span>
        </div>
        <span className="sun sunshine"></span>
        <span className="sun"></span>
        <div className="cloud back">
          <span className="left-back"></span>
          <span className="right-back"></span>
        </div>
      </div>

      <div className="card-header">
        <span>{`${city.name}, ${city.sys.country}`}</span>
        <span>{new Date(city.dt * 1000).toLocaleDateString()}</span>
      </div>

      <span className="temp">{`${Math.round(
        convertTemperature(city.main.temp)
      )}°${temperatureUnit.charAt(0)}`}</span>

      <div className="temp-scale">
        <span>{temperatureUnit}</span>
      </div>
      <button className="delete-button" onClick={() => onDelete(city)}>
        Delete
      </button>
    </div>
  );
}

function WeatherDashboard() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [temperatureUnit, setTemperatureUnit] = useState("Celsius");
  const [currentPage, setCurrentPage] = useState(1);

  const apiKey = "4e5968c6e740769f1f8cdc5381147623";

  useEffect(() => {
    if (search.trim() === "") {
      setSuggestions([]);
      return;
    }

    async function fetchSuggestions() {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/find?q=${search}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) {
          throw new Error("City not found");
        }
        const data = await response.json();
        const cityNames = data.list.map((city) => city.name);
        setSuggestions(cityNames);
      } catch (error) {
        setSuggestions([]);
      }
    }

    fetchSuggestions();
  }, [search]);

  async function fetchWeather(cityName) {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${
          temperatureUnit === "Celsius" ? "metric" : "imperial"
        }`
      );
      if (!response.ok) {
        throw new Error("City not found");
      }
      const weatherData = await response.json();
      setIsLoading(false);
      return weatherData;
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
      return null;
    }
  }

  const addCity = async () => {
    if (search.trim() === "") {
      setError("Please enter a city");
      return;
    }

    const weatherData = await fetchWeather(search);
    if (weatherData) {
      setCities([...cities, weatherData]);
      setSearch("");
      setError(null);
    }
  };

  const toggleTemperatureUnit = async () => {
    // Toggle the temperature unit
    setTemperatureUnit((prevUnit) =>
      prevUnit === "Celsius" ? "Fahrenheit" : "Celsius"
    );

    // Refetch weather data with the new temperature unit for all cities
    const updatedCities = await Promise.all(
      cities.map(async (city) => {
        const weatherData = await fetchWeather(city.name);
        return weatherData;
      })
    );

    // Update the cities with the new temperature unit
    setCities(updatedCities);
  };

  const convertTemperature = (tempInCelsius) => {
    if (temperatureUnit === "Fahrenheit") {
      return (tempInCelsius * 9) / 5 + 32;
    }
    return tempInCelsius;
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCity();
    }
  };

  const deleteCity = (cityToDelete) => {
    setCities(cities.filter((city) => city !== cityToDelete));
  };

  const cardsPerPage = 3;
  const totalPages = Math.ceil(cities.length / cardsPerPage);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = cities.slice(indexOfFirstCard, indexOfLastCard);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
      <div className="weather-dashboard dark-theme">
        <h1>Weather Dashboard</h1>
  
        <div className="search-container">
          <input
            className="search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a city name"
            list="city-suggestions"
          />
          <datalist id="city-suggestions">
            {suggestions.map((cityName) => (
              <option key={cityName} value={cityName} />
            ))}
          </datalist>
          <button className="button-85" onClick={addCity}>
            Enter
          </button>
          <button className="button-85 tog" onClick={toggleTemperatureUnit}>
            Toggle Unit
          </button>
        </div>
  
        {error && <p className="error">{error}</p>}
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div className="cards-container">
            {currentCards.map((city) => (
              <WeatherCard
                key={city.id}
                city={city}
                temperatureUnit={temperatureUnit}
                convertTemperature={convertTemperature}
                onDelete={deleteCity}
              />
            ))}
          </div>
        )}
  
        {cities.length > 0 && (
          <div className="pagination">
            <button
              className="button-85 previous"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="button-85 next"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
}

export default WeatherDashboard;
