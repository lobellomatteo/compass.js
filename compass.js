class Compass {

    // The name of the event we dispatch 
    // when the route changes
    static EVENT_ROUTE_CHANGE() {
        return "on-route-change"
    }

    constructor() {
        this.Routes = []

        // Setup all routes
        document.querySelectorAll("[route]").forEach(routeElement => {
            this.Routes.push({
                element: routeElement,
                route: routeElement.getAttribute("route")
            })
        })

        // Handle elements with "compass-link" attribute click
        document.addEventListener("click", (event) => {
            const compassLink = event.target.getAttribute("compass-link")
            if (compassLink) {
                this.changeRoute(compassLink)
            }
        }, false)

        // Check if the "/" route is present
        this.indexRoute = this.Routes.find(routeConfig => routeConfig.route == "/")
        if (!this.indexRoute) {
            console.error("The index route is not configured!")
        }

        // Check if the "404" route is present
        this.notFoundRoute = this.Routes.find(routeConfig => routeConfig.route == "/404")
        if (!this.notFoundRoute) {
            console.error("The 404 route is not configured!")
        }

        this._startListeningForRouteChange()
    }

    // Public function to change the current route, 
    // passing parameters if needed
    changeRoute(path, params = {}) {
        let newHash = "#!" + (path.startsWith("/") ? path : ("/" + path))

        let parameterNames = Object.keys(params)
        for (let i = 0; i < parameterNames.length; i++) {
            if (i == 0) {
                newHash += "?"
            } else {
                newHash += "&"
            }

            newHash += parameterNames[i] + "=" + encodeURIComponent(params[parameterNames[i]])
        }

        window.location.hash = newHash
    }

    // Public function to get a URL parameter
    getUrlParameter(name) {
        if (!location.href.includes("?")) {
            return null
        }

        const queryStringArray = location.href.split("?")
        if (!Array.isArray(queryStringArray) || queryStringArray.length == 0) {
            return null
        }

        const queryStringParamArray = queryStringArray[1].split("&")

        let nameValue = null
        for (let i = 0; i < queryStringParamArray.length; i++) {
            const queryStringNameValueArray = queryStringParamArray[i].split("=")
            if (name == queryStringNameValueArray[0]) {
                nameValue = queryStringNameValueArray[1]
            }
        }

        return nameValue
    }

    _startListeningForRouteChange() {
        onhashchange = () => {
            let newRoute = location.hash.replace("#!", "")
            if (newRoute.includes("?")) {
                newRoute = newRoute.split("?")[0]
            }

            // Find the route to show based on the hash
            let routeConfigToShow = this.Routes.find(routeConfig => {
                if (location.hash == "") {
                    return routeConfig.route == "/"
                }

                return routeConfig.route == newRoute
            })

            // Fallback to 404 element if the route is not present
            if (!routeConfigToShow) {
                if (!this.notFoundRoute) {
                    console.error("Couldn't show the 404 route as it was not set up.")
                    return
                }

                routeConfigToShow = this.notFoundRoute
            }

            this.Routes.forEach((routeConfig) => {
                const mustShowEl = routeConfig.route == routeConfigToShow.route
                routeConfig.element.style.display = mustShowEl ? "block" : "none"
            })

            const event = new CustomEvent(this.EVENT_ROUTE_CHANGE, { detail: { newRoute } })
            document.dispatchEvent(event)
        }

        // Needed for the first setup
        onhashchange()
    }
}

// This way, the Router instance will be visible everywhere
Router = new Compass()