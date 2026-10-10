# Optional weather

Choose a city beside the clock on Home. Search results let you select the exact city. No device location, IP lookup, account or API key is requested. Sela sends the city search to Open-Meteo geocoding, then the selected city’s coordinates to the forecast service. Providers receive ordinary network information such as IP addresses.

Temperature and weather conditions come from [Open-Meteo](https://open-meteo.com/), with [CC BY 4.0 attribution](https://open-meteo.com/en/terms). The free hosted API is for non-commercial use and has no uptime guarantee; commercial deployments need the provider’s paid endpoint or a suitable self-hosted alternative. See [pricing](https://open-meteo.com/en/pricing).

Sela stores the chosen city and last result locally and refreshes at most every 30 minutes while visible. Cached results remain available offline and are identified as a last update when stale. Use Turn off weather to stop requests and remove the saved city. Failures never prevent reading books.
