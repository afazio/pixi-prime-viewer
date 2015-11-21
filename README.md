# pixi-prime-viewer

View prime numbers in a unique way and discover hints of a pattern in their distribution.  View it
in action [here](http://afaz.io/pixi-prime-viewer/)!

### Install

    git clone https://github.com/afazio/pixi-prime-viewer.git
    cd pixi-prime-viewer

### Run

Open ./public/index.html in your favorite browser.
    
### Develop

To work on this code base first `cd` into the project and run `npm install`.  This will install all
the necessary node packages.

    npm install

If you don't already have webpack and webpack-dev-server installed globally on your machine, do that
now:

    npm install -g webpack webpack-dev-server

And then startup a server with auto-reloading with `npm start`.  Browse to `localhost:8080` to view
the app as you make changes to the code.  Note that webpack-dev-server will automatically see
changes to the code, recompile, and then reload your browser for you.

    npm start

If you want to make a static build of the code then run `npm build`.  This will create a file in
`public/client.js` that contains the static build for use in deploying the app to others.
