# SpinFlix [Project Link](https://bhagyashree-vaidya.github.io/spinflix/)

## What is it?

An interactive React web application designed to eliminate decision fatigue on movie nights. Users can search a comprehensive movie database, build a customized shortlist, and spin a virtual wheel to randomly select their next watch.

## Use Cases

Built for movie enthusiasts, couples, and groups who frequently struggle to agree on a film across crowded streaming platforms.

## How to Log In / Access

* **Live URL:** [https://bhagyashree-vaidya.github.io/spinflix/](https://bhagyashree-vaidya.github.io/spinflix/)
* **Access:** Publicly accessible; no account creation or login required.

## Pages & Features

**Interactive Movie Wheel**

* A dynamic, animated selection wheel that randomly picks a winner from the user's custom shortlist.
* Includes validation logic to ensure at least two movies are added before a spin can be triggered.

**Movie Search & Selection**

* Intuitive search interface allowing users to look up and seamlessly add specific titles to their spin list.
* Easy management of the current movie queue, allowing users to add or remove options on the fly.

## Integrations / Setup

* **TMDB API Integration:** Integrates with The Movie Database (TMDB) REST API to fetch and display accurate, up-to-date movie search results, titles, and poster imagery.
* **Environment Setup:** Developers cloning the repository will need to supply their own TMDB API key in a `.env` file to enable search functionality locally.

## Miscellaneous

* **State Management:** Utilizes React state to manage the active movie list and search queries during the user's session.
* **Responsive Design:** Fully optimized for both desktop and mobile, making it easy to use quickly from the couch.
* **Data State:** Uses live data from TMDB.

## Tech Stack

* Frontend: React
* API / Data: TMDB (The Movie Database) API
* Deployment: GitHub Pages
