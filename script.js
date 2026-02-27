const settingsIcon = document.getElementById('settingsIcon');
const settingsMenu = document.getElementById('settingsMenu');
const favoritesButton = document.getElementById('favoritesButton');
const favoritesOverlay = document.getElementById('favoritesOverlay');
const favoritesContent = document.querySelector('.favorites-content');
const chartSpinner = document.getElementById('chartSpinner');
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const siteLogo = document.getElementById('siteLogo');
const siteLogoSmall = document.getElementById('siteLogoSmall');
const siteFooter = document.querySelector('.site-footer');
const mainView = document.getElementById('mainView');
const countryDetailsView = document.getElementById('countryDetailsView');
const countryFlag = document.getElementById('countryFlag');
const countryName = document.getElementById('countryName');
const countryCapital = document.getElementById('countryCapital');
const countryRegion = document.getElementById('countryRegion');
const countryPopulation = document.getElementById('countryPopulation');
const countryCurrency = document.getElementById('countryCurrency');
const countryLanguage = document.getElementById('countryLanguage');
const countryTimezone = document.getElementById('countryTimezone');
const favoriteStar = document.getElementById('favoriteStar');
const conversionCurrencySelect = document.getElementById('conversionCurrencySelect');
const currencyCodeElement = document.getElementById('currencyCode');
const conversionCurrencyCodeElement = document.getElementById('conversionCurrencyCode');
const currencyAmountInput = document.getElementById('currencyAmount');
const convertedAmountSpan = document.getElementById('convertedAmount');
const chartButtons = document.querySelectorAll('.chart-btn');
const currencyChartCanvas = document.getElementById('currencyChart');
const chartMessageElement = document.getElementById('chartMessage');
const calculatorButton = document.getElementById('calculatorButton');
const chartControlsDiv = document.querySelector('.chart-controls');
const calculatorOverlay = document.getElementById('calculatorOverlay');
const closeCalculatorButton = document.getElementById('closeCalculator');
const baseAmountInput = document.getElementById('baseAmountInput');
const calculatedAmountSpan = document.getElementById('calculatedAmount');
const calcBaseCurrencyCode = document.getElementById('calcBaseCurrencyCode');
const calcTargetCurrencyCode = document.getElementById('calcTargetCurrencyCode');
const rateBaseCode = document.getElementById('rateBaseCode');
const rateValueSpan = document.getElementById('rateValue');
const rateTargetCode = document.getElementById('rateTargetCode');
const reverseConversionButton = document.getElementById('reverseConversionButton');
const currencyContainer= document.querySelector('.currency-converter');

let allCountries = [];
let availableCurrencies = {};
let currentCountryData = null;
let favorites = [];
let currencyChartInstance = null;
let currentExchangeRate = null;
let calcBaseCurrency = null;
let calcTargetCurrency = null;

function setConversionDisplay(baseCurrency, targetCurrency, isSupported) {
    const currencyConverterDiv = currencyAmountInput.closest('.currency-converter');
    const amountInput = currencyAmountInput;
    const baseCode = currencyCodeElement;
    const targetCode = conversionCurrencyCodeElement;
    const resultSpan = convertedAmountSpan;
    const converterLabel = currencyConverterDiv.querySelector('label');
    const na = document.querySelector('#na');
    const isSameCurrency = baseCurrency === targetCurrency && isSupported;

    if (isSupported && !isSameCurrency) {
        amountInput.style.display = 'inline';
        baseCode.style.display = 'inline';
        targetCode.style.display = 'inline';
        resultSpan.style.display = 'inline';
        converterLabel.style.display = 'inline';
        na.style.display = 'inline';

        amountInput.textContent = '1';
        resultSpan.textContent = '...';
        converterLabel.textContent = 'Currency Converter:';
        baseCode.textContent = baseCurrency;
        targetCode.textContent = targetCurrency + ':';

        currencyConverterDiv.classList.remove('error-state');

        chartControlsDiv.classList.remove('hidden-view');
        calculatorButton.classList.remove('hidden-view');

    } else if (isSameCurrency) {
        amountInput.style.display = 'none';
        baseCode.style.display = 'none';
        targetCode.style.display = 'none';
        na.style.display = 'none';

        converterLabel.textContent = 'Currency Converter:';
        resultSpan.textContent = 'Same Currency';
        resultSpan.style.display = 'inline';
        currencyConverterDiv.classList.add('error-state');

        chartControlsDiv.classList.add('hidden-view');
        calculatorButton.classList.add('hidden-view');

    } else {
        const message = baseCurrency === 'N/A'
            ? 'Currency Unknown.'
            : `Currency ${baseCurrency} not supported by API.`;

        converterLabel.textContent = 'Currency Error:';
        amountInput.style.display = 'none';
        baseCode.style.display = 'none';
        targetCode.style.display = 'none';
        na.style.display = 'none';
        resultSpan.textContent = message;
        resultSpan.style.display = 'inline';
        currencyConverterDiv.classList.add('error-state');
        chartControlsDiv.classList.add('hidden-view');
        calculatorButton.classList.add('hidden-view');
    }
}

function setDarkMode(isDark) {
    if (isDark) {
        body.classList.add('dark-mode');
        siteLogo.src = 'assets/ciemne_logo.png';
        siteLogoSmall.src = 'assets/ciemne_logo.png';
    } else {
        body.classList.remove('dark-mode');
        siteLogo.src = 'assets/jasne_logo.png';
        siteLogoSmall.src = 'assets/jasne_logo.png';
    }
    localStorage.setItem('darkMode', isDark);

    if (currencyChartInstance) {
        const activePeriod = document.querySelector('.chart-btn.active').dataset.period;
        fetchAndRenderChart(currentCountryData.currencyCode, conversionCurrencySelect.value, activePeriod);
    }
    if (typeof AOS !== 'undefined') {
        AOS.refreshHard();
    }
}

function loadFavorites() {
    const storedFavorites = localStorage.getItem('favorites');
    favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isFavorite(countryCommonName) {
    return favorites.includes(countryCommonName);
}

function toggleFavorite(country) {
    const countryCommonName = country.commonName;
    const index = favorites.indexOf(countryCommonName);

    if (index > -1) {
        favorites.splice(index, 1);
        favoriteStar.classList.remove('fas');
        favoriteStar.classList.add('far');
    } else {
        favorites.push(countryCommonName);
        favoriteStar.classList.remove('far');
        favoriteStar.classList.add('fas');
    }
    saveFavorites();
}

function removeFavoriteFromList(commonName) {
    const index = favorites.indexOf(commonName);
    if (index > -1) {
        favorites.splice(index, 1);
        saveFavorites();
        renderFavoritesList();

        if (currentCountryData && currentCountryData.commonName === commonName) {
            favoriteStar.classList.remove('fas');
            favoriteStar.classList.add('far');
        }
    }
}

function renderFavoritesList() {
    const favoritesContent = document.querySelector('.favorites-content');

    let closeButtonHtml = '<button id="closeFavorites">Close</button>';
    let listHtml = '<h2>Favorites</h2>';

    if (favorites.length === 0) {
        listHtml += '<p>You do not have any favorite countries yet.</p>';
    } else {
        listHtml += '<ul class="favorites-list">';

        favorites.forEach(commonName => {
            const country = allCountries.find(c => c.commonName === commonName);
            if (country) {
                listHtml += `<li data-country-common-name="${commonName}">
                    <span class="favorite-name-flag">
                        ${country.name}
                        <img src="${country.flags.svg}" alt="Flag" style="height: 15px; margin-left: 10px; border: 1px solid #ccc;">
                    </span>
                    <i class="fas fa-trash-alt remove-favorite" data-common-name="${commonName}" style="cursor: pointer; color: #cc0000; margin-left: 10px;"></i>
                </li>`;
            }
        });

        listHtml += '</ul>';
    }


    favoritesContent.innerHTML = listHtml + closeButtonHtml;

    document.getElementById('closeFavorites').addEventListener('click', () => {
        favoritesOverlay.classList.remove('visible');
    });

    favoritesContent.querySelectorAll('.favorites-list li').forEach(item => {
        const commonName = item.dataset.countryCommonName;

        const removeIcon = item.querySelector('.remove-favorite');
        removeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavoriteFromList(commonName);
        });

        item.querySelector('.favorite-name-flag').addEventListener('click', function() {
            const country = allCountries.find(c => c.commonName === commonName);
            if (country) {
                favoritesOverlay.classList.remove('visible');
                showCountryDetails(country);
            }
        });

        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-favorite')) {
                return;
            }
            const country = allCountries.find(c => c.commonName === commonName);
            if (country) {
                favoritesOverlay.classList.remove('visible');
                showCountryDetails(country);
            }
        });
    });
}


async function fetchCountries() {
    try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,translations,flags,capital,region,population,currencies,languages,timezones");
        const data = await res.json();

        const regionMap = {
            "Europe": "Europe",
            "Asia": "Asia",
            "Africa": "Africa",
            "Americas": "Americas",
            "Oceania": "Oceania",
            "Antarctic": "Antarctica"
        };

        const currencyMap = {};

        allCountries = data.map(c => {
            const countryNameDisplay = c.name.common;

            const currencyCode = c.currencies ? Object.keys(c.currencies)[0] : 'N/A';
            const currencyName = c.currencies && c.currencies[currencyCode] ? c.currencies[currencyCode].name : 'N/A';

            const capitalDisplay = c.capital && c.capital.length > 0 ? c.capital[0] : 'N/A';


            const languageNames = c.languages
                ? Object.values(c.languages).join(', ')
                : 'N/A';

            if (currencyCode !== 'N/A') availableCurrencies[currencyCode] = currencyName;

            return {
                name: countryNameDisplay,
                commonName: c.name.common,
                flags: c.flags,
                capital: capitalDisplay,
                region: regionMap[c.region] || c.region || 'N/A',
                population: c.population ? c.population.toLocaleString('en-US') : 'N/A',
                currencyCode: currencyCode,
                currencyName: currencyName,
                languages: languageNames,
                timezones: c.timezones ? c.timezones.join(', ') : 'N/A',
            };
        }).sort((a, b) => a.name.localeCompare(b.name, "en"));

        await fetchFrankfurterCurrencies();
        populateCurrencySelect(availableCurrencies);

    } catch (error) {
        console.error("Błąd pobierania danych o krajach:", error);
        const input = document.querySelector(".search-input");
        input.placeholder = "Error fetching countries";
        const desc = document.querySelector('.description-text');
        desc.innerHTML = "Error fetching countries.<br>Please try again later!";
        desc.style.color = 'red';
        desc.style.textDecoration = 'underline';
    }
}

async function fetchFrankfurterCurrencies() {
    try {
        const response = await fetch('https://api.frankfurter.app/latest');
        const data = await response.json();
        const frankfurterCurrencies = Object.keys(data.rates);

        if (!availableCurrencies[data.base]) {
             availableCurrencies[data.base] = data.base;
        }

        const filteredCurrencies = {};
        Object.keys(availableCurrencies).forEach(code => {
            if (frankfurterCurrencies.includes(code) || code === data.base) {
                filteredCurrencies[code] = availableCurrencies[code];
            }
        });
        availableCurrencies = filteredCurrencies;

    } catch (error) {
        console.error("Błąd pobierania walut z Frankfurter:", error);
    }
}

async function fetchLatestRate(baseCurrency, targetCurrency) {
    if (baseCurrency === 'N/A') {
        return { rate: null, error: "Country currency is unknown." };
    }
    if (!availableCurrencies[baseCurrency] || !availableCurrencies[targetCurrency]) {
        return { rate: null, error: `Currency ${baseCurrency} is not supported by the API.` };
    }


    try {
        const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrency}`);
        const data = await response.json();

        if (data.rates && data.rates[targetCurrency]) {
            return { rate: data.rates[targetCurrency], error: null };
        } else {
            return { rate: null, error: `No current rate available for ${baseCurrency} to ${targetCurrency}.` };
        }
    } catch (error) {
        console.error("Błąd pobierania kursu:", error);
        return { rate: null, error: "Error connecting to the currency exchange API." };
    }
}

async function fetchHistoricalRates(baseCurrency, targetCurrency, days) {
    const dates = getDates(days);

    const url = `https://api.frankfurter.app/${dates.startDate}..${dates.endDate}?from=${baseCurrency}&to=${targetCurrency}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.rates && Object.keys(data.rates).length > 0) {
            return data.rates;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Błąd pobierania danych historycznych:", error);
        return null;
    }
}

function populateCurrencySelect(currencies) {
    const codes = Object.keys(currencies).sort();
    conversionCurrencySelect.innerHTML = '';

    codes.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code} - ${currencies[code] || code}`;
        conversionCurrencySelect.appendChild(option);
    });

    const storedCurrency = localStorage.getItem('conversionCurrency') || 'USD';
    if (conversionCurrencySelect.querySelector(`option[value="${storedCurrency}"]`)) {
        conversionCurrencySelect.value = storedCurrency;
    } else if (codes.includes('USD')) {
        conversionCurrencySelect.value = 'USD';
    } else if (codes.length > 0) {
        conversionCurrencySelect.value = codes[0];
    }

    
}

async function updateCurrencyConversion(baseCurrency) {
    const amount = parseFloat(currencyAmountInput.textContent) || 1;
    const targetCurrency = conversionCurrencySelect.value;

    const convertedAmountElement = convertedAmountSpan;

    const result = await fetchLatestRate(baseCurrency, targetCurrency);

    if (result.error) {
        convertedAmountElement.textContent = "N/A";
        currentExchangeRate = null;
        rateValueSpan.textContent = 'N/A';
        return;
    }

    currentExchangeRate = result.rate;
    rateValueSpan.textContent = formatConvertedValue(currentExchangeRate);

    const adjustedAmount = amount;
    const rate = result.rate;


    const finalValue = adjustedAmount * rate;
    convertedAmountElement.textContent = formatConvertedValue(finalValue);
}

function getDates(daysAgo) {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysAgo);

    const formatDate = (date) => date.toISOString().split('T')[0];

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(today)
    };
}

async function fetchAndRenderChart(baseCurrency, targetCurrency, period) {
    chartSpinner.classList.add('active');
    
    chartMessageElement.classList.add('hidden-view');
    currencyChartCanvas.classList.add('hidden-view');

    if (currencyChartInstance) {
        currencyChartInstance.destroy();
        currencyChartInstance = null;
    }

    if (baseCurrency === targetCurrency) {
        chartSpinner.classList.remove('active');
        showChartMessage(`Cannot display chart for the same currency. Change the currency in settings.`);
        return;
    }

    if (baseCurrency === 'N/A' || !availableCurrencies.hasOwnProperty(baseCurrency)) {
        chartSpinner.classList.remove('active');
        setConversionDisplay(baseCurrency, targetCurrency, false);
        showChartMessage(`Currency ${baseCurrency} is not supported by the Frankfurter API. Chart unavailable.`);
        return;
    }

    const rates = await fetchHistoricalRates(baseCurrency, targetCurrency, period);

    chartSpinner.classList.remove('active');

    if (!rates || Object.keys(rates).length === 0) {
        showChartMessage(`Failed to fetch historical data for ${baseCurrency} to ${targetCurrency} over ${period} days.`);
        return;
    }

    const labels = Object.keys(rates).sort();
    const dataPoints = labels.map(date => rates[date][targetCurrency]);

    const isDarkMode = document.body.classList.contains('dark-mode');

    const chartColor = isDarkMode
        ? getComputedStyle(document.documentElement).getPropertyValue('--button-color')
        : getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

    const chartColorRgba = chartColor.trim() === '#005EFF' ? 'rgba(0, 94, 255, 0.1)' : 'rgba(94, 189, 158, 0.2)';

    currencyChartInstance = new Chart(currencyChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Rate of 1 ${baseCurrency} to ${targetCurrency}`,
                data: dataPoints,
                borderColor: chartColor,
                backgroundColor: chartColorRgba,
                tension: 0.2,
                fill: true,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                         autoSkip: true,
                         maxTicksLimit: 10,
                         color: isDarkMode ? 'white' : 'black'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: `Value in ${targetCurrency}`
                    },
                    ticks: {
                         color: isDarkMode ? 'white' : 'black'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: isDarkMode ? 'white' : 'black'
                    }
                }
            }
        }
    });

    chartMessageElement.classList.add('hidden-view');
    currencyChartCanvas.classList.remove('hidden-view');

}

function showChartMessage(message) {
    chartSpinner.classList.remove('active');
    if (currencyChartInstance) {
        currencyChartInstance.destroy();
        currencyChartInstance = null;
    }
    currencyChartCanvas.classList.add('hidden-view');
    chartMessageElement.classList.remove('hidden-view');
    chartMessageElement.textContent = message;
}

function formatConvertedValue(value) {
    let digits = 2;

    if (value < 1) digits = 4;
    if (value < 0.01) digits = 6;
    if (value < 0.0001) digits = 8;

    return parseFloat(value.toFixed(digits)).toString();
}

function setupSearchInput(inputElement, suggestionsElement) {
    inputElement.addEventListener("input", () => {
        const value = inputElement.value.trim().toLowerCase();
        suggestionsElement.innerHTML = "";

        if (!value) {
            suggestionsElement.style.display = "none";
            return;
        }
        const mainContainer=document.querySelector(".main-section")

        const filtered = allCountries
            .filter(c => c.name.toLowerCase().startsWith(value))
            .slice(0, 10);

        filtered.forEach(country => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.textContent = country.name;
            div.addEventListener("click", () => {
                inputElement.value = "";
                suggestionsElement.innerHTML = "";
                suggestionsElement.style.display = "none";
                mainContainer.style.display="none"
                showCountryDetails(country);

            });
            suggestionsElement.appendChild(div);
        });

        suggestionsElement.style.display = filtered.length ? "block" : "none";
        if(inputElement.classList.contains('details-search-input')) {
            const searchBoxRect = inputElement.closest('.search-box').getBoundingClientRect();
            suggestionsElement.style.top = `${searchBoxRect.height - 1}px`;
            suggestionsElement.style.left = '0';
        }
    });
}

function showMainView() {
    mainView.classList.remove('hidden-view');
    countryDetailsView.classList.add('hidden-view');
    siteFooter.classList.add('hidden-view');
    currentCountryData = null;
    if (currencyChartInstance) {
        currencyChartInstance.destroy();
        currencyChartInstance = null;
    }
}

function showCountryDetails(country) {
    currentCountryData = country;

    countryFlag.src = country.flags.svg;
    countryFlag.alt = `Flag of ${country.name}`;
    countryName.textContent = country.name;
    countryCapital.textContent = country.capital;
    countryRegion.textContent = country.region;
    countryPopulation.textContent = country.population;
    countryCurrency.textContent = `${country.currencyName} (${country.currencyCode})`;
    countryLanguage.textContent = country.languages;
    countryTimezone.textContent = country.timezones;

    currencyCodeElement.textContent = country.currencyCode;

    const targetCurrency = conversionCurrencySelect.value;
    const baseCurrency = country.currencyCode;

    const isSupported = baseCurrency !== 'N/A' && availableCurrencies.hasOwnProperty(baseCurrency);

    setConversionDisplay(baseCurrency, targetCurrency, isSupported);

    document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
    const defaultBtn = document.querySelector('.chart-btn[data-period="7"]');

    if (defaultBtn) defaultBtn.classList.add('active');

    if (isSupported && baseCurrency !== targetCurrency) {
        updateCurrencyConversion(baseCurrency);
        fetchAndRenderChart(baseCurrency, targetCurrency, defaultBtn.dataset.period);
    } else if (baseCurrency === targetCurrency) {
        showChartMessage(`Cannot display chart for the same currency. Change the currency in settings.`);
    } else {
         showChartMessage(`Currency ${baseCurrency} is not supported by the Frankfurter API. Chart unavailable.`);
    }

    favoriteStar.classList.remove('fas', 'far');

    if (isFavorite(country.commonName)) {
        favoriteStar.classList.add('fas');
    } else {
        favoriteStar.classList.add('far');
    }

    mainView.classList.add('hidden-view')
    countryDetailsView.classList.remove('hidden-view');
    siteFooter.classList.remove('hidden-view');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof AOS !== 'undefined') {
        setTimeout(() => {
            AOS.refreshHard();
        }, 50);
    }
}

function triggerSearch(query, inDetailsView) {
    if (!query) return;

    const match = allCountries.find(c =>
        c.name.toLowerCase().startsWith(query.toLowerCase())
    );

    if (!match) {
        const suggestionsEl = inDetailsView ? document.getElementById("detailsSuggestions") : document.getElementById("suggestions");
        suggestionsEl.innerHTML = "";
        suggestionsEl.style.display = "none";
        return;
    }

    const inputToClear = inDetailsView ? detailsSearchInput : mainSearchInput;

    inputToClear.value = "";

    if (inDetailsView) {
        document.getElementById("detailsSuggestions").innerHTML = "";
        document.getElementById("detailsSuggestions").style.display = "none";
    } else {
        document.getElementById("suggestions").innerHTML = "";
        document.getElementById("suggestions").style.display = "none";
        document.querySelector(".main-section").style.display = "none";
    }

    showCountryDetails(match);
}

async function updateCalculatorConversion() {
    const amount = parseFloat(baseAmountInput.value);

    if (isNaN(amount) || amount <= 0 || calcBaseCurrency === null) {
        calculatedAmountSpan.textContent = '0.00';
        return;
    }

    const result = await fetchLatestRate(calcBaseCurrency, calcTargetCurrency);

    if (result.error) {
        calculatedAmountSpan.textContent = 'N/A';
        rateValueSpan.textContent = 'N/A';
        return;
    }

    const currentRate = result.rate;
    rateValueSpan.textContent = formatConvertedValue(currentRate);

    const finalValue = amount * currentRate;
    calculatedAmountSpan.textContent = formatConvertedValue(finalValue);
}

function reverseConversion() {
    if (calcBaseCurrency === null) return;

    [calcBaseCurrency, calcTargetCurrency] = [calcTargetCurrency, calcBaseCurrency];

    calcBaseCurrencyCode.textContent = calcBaseCurrency;
    calcTargetCurrencyCode.textContent = calcTargetCurrency;
    rateBaseCode.textContent = calcBaseCurrency;
    rateTargetCode.textContent = calcTargetCurrency;

    updateCalculatorConversion();
}

function openCalculatorModal() {
    if (!currentCountryData || currentExchangeRate === null) {
        alert("Cannot open calculator: Currency rate data is unavailable or unsupported.");
        return;
    }

    const baseCurrency = currentCountryData.currencyCode;
    const targetCurrency = conversionCurrencySelect.value;

    calcBaseCurrency = baseCurrency;
    calcTargetCurrency = targetCurrency;

    calcBaseCurrencyCode.textContent = calcBaseCurrency;
    calcTargetCurrencyCode.textContent = calcTargetCurrency;
    rateBaseCode.textContent = calcBaseCurrency;
    rateTargetCode.textContent = calcTargetCurrency;

    baseAmountInput.value = '1';
    updateCalculatorConversion();

    calculatorOverlay.classList.add('visible');

    if (typeof AOS !== 'undefined') {
        AOS.refreshHard();
    }
}

function closeCalculatorModal() {
    calculatorOverlay.classList.remove('visible');
}

document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        darkModeToggle.checked = true;
    }
    setDarkMode(isDarkMode);

    const storedCurrency = localStorage.getItem('conversionCurrency') || 'PLN';
    

    loadFavorites();

    if (mainView && !mainView.classList.contains('hidden-view')) {
        siteFooter.classList.add('hidden-view');
    }

    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            duration: 800,
            disable: 'phone'
        });
    }

    const mainInput = document.querySelector(".search-input");
    const mainSuggestions = document.getElementById("suggestions");
    const detailsInput = document.querySelector(".details-search-input");
    const detailsSuggestions = document.getElementById("detailsSuggestions");

    setupSearchInput(mainInput, mainSuggestions);
    setupSearchInput(detailsInput, detailsSuggestions);

    document.addEventListener("click", e => {
        if (!mainInput.contains(e.target) && !mainSuggestions.contains(e.target)) {
            mainSuggestions.style.display = "none";
        }
        if (!detailsInput.contains(e.target) && !detailsSuggestions.contains(e.target)) {
            detailsSuggestions.style.display = "none";
        }
    });

    fetchCountries();
});

settingsIcon.addEventListener('click', () => {
    settingsIcon.classList.toggle('rotated');
    settingsMenu.classList.toggle('open');
    settingsIcon.style.position='fixed';
});

favoritesButton.addEventListener('click', () => {
    renderFavoritesList();
    favoritesOverlay.classList.add('visible');
});

darkModeToggle.addEventListener('change', (event) => {
    setDarkMode(event.target.checked);
});

conversionCurrencySelect.addEventListener('change', (event) => {
    const newCurrency = event.target.value;
    localStorage.setItem('conversionCurrency', newCurrency);
    

    if (currentCountryData) {
        const baseCurrency = currentCountryData.currencyCode;

        const isSupported = baseCurrency !== 'N/A' && availableCurrencies.hasOwnProperty(baseCurrency);

        setConversionDisplay(baseCurrency, newCurrency, isSupported);

        if (isSupported) {
            if (baseCurrency !== newCurrency) {
                 updateCurrencyConversion(baseCurrency);
                 const activeBtn = document.querySelector('.chart-btn.active');
                 const activePeriod = activeBtn ? activeBtn.dataset.period : '7';
                 fetchAndRenderChart(baseCurrency, newCurrency, activePeriod);
            } else {
                showChartMessage(`Cannot display chart for the same currency. Change the currency in settings.`);
            }
        } else {
             showChartMessage(`Currency ${baseCurrency} is not supported by the Frankfurter API. Chart unavailable.`);
        }
    }
});

favoritesOverlay.addEventListener('click', (e) => {
    if (!favoritesContent.contains(e.target)) {
        favoritesOverlay.classList.remove('visible');
    }
});

favoritesContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-favorite')) {
        const name = e.target.dataset.commonName;
        removeFavoriteFromList(name);
    }

    if (e.target.id === 'closeFavorites') {
        favoritesOverlay.classList.remove('visible');
    }
});

favoriteStar.addEventListener('click', () => {
    if (currentCountryData) {
        toggleFavorite(currentCountryData);
    }
});

chartButtons.forEach(button => {
    button.addEventListener('click', function() {
        chartButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        if (currentCountryData) {
            const baseCurrency = currentCountryData.currencyCode;
            const targetCurrency = conversionCurrencySelect.value;
            const period = this.dataset.period;

            if (baseCurrency !== targetCurrency) {
                fetchAndRenderChart(baseCurrency, targetCurrency, period);
            } else {
                 showChartMessage(`Cannot display chart for the same currency. Change the currency in settings.`);
            }
        }
    });
});

const mainSearchInput = document.querySelector(".search-input");
const mainSearchButton = document.getElementById("searchIcon");

if (mainSearchButton) {
    mainSearchButton.addEventListener("click", () => {
        triggerSearch(mainSearchInput.value.trim(), false);
    });
}

const detailsSearchInput = document.querySelector(".details-search-input");
const detailsSearchButton = document.getElementById("detailsSearchIcon");

if (detailsSearchButton) {
    detailsSearchButton.addEventListener("click", () => {
        triggerSearch(detailsSearchInput.value.trim(), true);
    });
}

mainSearchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") triggerSearch(mainSearchInput.value.trim(), false);
});
detailsSearchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") triggerSearch(detailsSearchInput.value.trim(), true);
});

calculatorButton.addEventListener('click', openCalculatorModal);
closeCalculatorButton.addEventListener('click', closeCalculatorModal);

calculatorOverlay.addEventListener('click', (e) => {
    if (!document.querySelector('.calculator-content').contains(e.target)) {
        closeCalculatorModal();
    }
});

baseAmountInput.addEventListener('input', updateCalculatorConversion);

baseAmountInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        updateCalculatorConversion();
        e.preventDefault();
    }
});

reverseConversionButton.addEventListener('click', reverseConversion);
