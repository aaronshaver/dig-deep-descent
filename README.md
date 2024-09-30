# Dig: Deep Descent

## Status update 2024-09-30

I have decided to focus on my paid freelancing job and put this unpaid side project on pause.

I have learned more about Jest testing, CSS, and JavaScript event listeners/event dispatching/etc. As well, I got more practice with project management/scope/planning, TDD, and OO-design.

It was also interesting to create my own game engine from scratch. This had benefits, like total control of it, and not needing to spend hours looking up Unity quirks and such. But it had real downsides too, like much less power to make fancy graphics, no built-in physics or animation or simulation systems to take advantage of, and needing to re-invent the wheel for problems that engines have already solved. If I ever attempt to make another game in the future, I will use an engine.

## Features

* Sophisticated terrain generation system: new rock and mineral types fade in gradually as player digs further down
* Lighting system in which light drops off at a distance
* Battery depletion system: different actions deplete battery at different rates
* Storage system to store minerals
* Rocks have varying hardness/density
* Scanner system to scan and reveal minerals

## Try it out

https://aaronshaver.github.io/dig-deep-descent/

## Testing

Run `npm install jest-environment-jsdom` before running the tests to be able to use a test DOM rather than a real DOM