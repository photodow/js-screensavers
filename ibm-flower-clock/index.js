class FlowerClock { // dependency on d3
    constructor(data, options) {
        // options
        this.options = {
            selector: '.flower-clock',
            radius: Math.min(window.innerWidth, window.innerHeight) * .4, // radius = max
            pinHeadRadius: 3, // pinHeadRadius * 2 = min
            duration: 1250,
            padding: 10,
            petalWidth: 15,
            entranceDelay: 0, // [0, 0],
            easingIn: d3.easeBackOut.overshoot(1)
        };

        // additional options
        this.options.reducedDuration = this.options.duration / 3;
        this.updateData();

        // initialize the chart
        this.initChart();
    }

    updateChart() {
        this.updateData();
        this.managePetals();
        this.managePins();
    }

    updateData() {
        this.data = this.getDateTime();
        this.options.delayInc = this.options.duration * .6 / this.data.length;
    }

    initChart() {
        const {
            selector,
            radius,
            duration,
            padding
        } = this.options;
        const measurements = (radius + padding) * 2;
        const viewBox = `0 0 ${measurements} ${measurements}`;

        const container = d3.select(selector);

        container.selectAll('svg').remove(); // incase any exist remove them

        // create the svg
        this.chart = container.append('svg')
            .attr('viewBox', viewBox)
            .attr('style', `transition-duration: ${duration}ms;`);

        this.initPetals();
        this.initPins();
        
        setTimeout(() => this.enterRotation(), 0); // entry animation
    }

    initPetals() { // create a group to contain the "flower petals"
        const {
            radius,
            petalWidth,
            padding
        } = this.options;

        this.petals = this.chart.append('g')
            .classed('petals', true)
            .attr('transform', `translate(${(radius + padding) - (petalWidth / 2)}, ${radius + padding})`);

        this.managePetals();
    }

    managePetals() {
        const {
            petalWidth,
            duration,
            radius,
            reducedDuration,
            easingIn,
            delayInc
        } = this.options;
        const {
            secondsMinutesInc
        } = this;
        const petal = this.petals.selectAll('.petal').data(this.data.splice(0, 2).reverse());

        // update petal based on updated/existing data
        petal.transition()
            .duration(reducedDuration)
            .ease(easingIn)
            .attr('transform', transformValue);

        // create petal based on new data
        petal.enter()
            .append('rect')
            .classed('petal', true)
            .attr('transform', transformValue)
            .attr('width', petalWidth)
            .attr('rx', petalWidth / 2)
            .attr('ry', petalWidth / 2)
            .transition()
            .duration(duration)
            .delay(() => {
                const value = this.options.entranceDelay;
                this.options.entranceDelay += delayInc;
                return value;
            })
            .ease(easingIn)
            .attr('height', (d, i) => this.calcPetalLength() / (i + 1));

        function transformValue(d, i) {
            const metric = (i === 1) ? 12 : 60;
            let value = `rotate(${secondsMinutesInc(d, metric)}`;
            value += `,${petalWidth / 2} 0)`;
            value += `,translate(0, -${petalWidth / 2})`;

            return value;
        }
    }

    initPins() { // create a group to contain the pins
        const {
            radius,
            padding
        } = this.options;

        this.pins = this.chart.append('g')
            .classed('pins', true)
            .attr('transform', `translate(${radius + padding}, ${radius + padding})`);

        this.managePins();
    }

    managePins() {
        const {
            pinHeadRadius,
            duration,
            radius,
            reducedDuration,
            easingIn,
            delayInc
        } = this.options;
        const {
            secondsMinutesInc
        } = this;
        const pin = this.pins.selectAll('.pin').data(this.data);

        let intLengthDelay = [0, 0];

        // pin updated based on updated/existing data
        pin.transition('pin-animation-update')
            .duration(reducedDuration)
            .ease(easingIn)
            .attr('transform', transformValue);

        // create pin based on new data
        const pinEnter = pin.enter()
            .append('g')
            .classed('pin', true)
            .attr('transform', transformValue)

        pinEnter.append('line')
            .classed('pin-line', true)
            .attr('stroke-width', 1)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("stroke-width", 1)
            .transition('pin-animation-creation')
            .duration(duration)
            .delay(this.options.entranceDelay)
            .ease(easingIn)
            .attr("y2", this.calcPinLength());

        pinEnter.append('circle')
            .attr('class', 'pin-head')
            .attr('cx', 0)
            .attr('r', pinHeadRadius)
            .transition('pin-animation-creation')
            .duration(duration)
            .delay(() => {
                const value = this.options.entranceDelay;
                this.options.entranceDelay += delayInc;
                return value;
            })
            .ease(easingIn)
            .attr('cy', this.calcPinLength());

        function transformValue(d) {
            let value = `rotate(${secondsMinutesInc(d, 60)}, 0 0)`;
            value += `, translate(0, 0)`;

            return value;
        }
    }

    secondsMinutesInc(v, m) {
        return 360 * v / m;
    }

    enterRotation() {
        this.chart.classed('enter', true);
    }

    calcPinLength() {
        const {
            pinHeadRadius,
            radius
        } = this.options;
        const pinHeadDiameter = pinHeadRadius * 2;

        return radius - pinHeadDiameter;
    }

    calcPetalLength() {
        const {
            petalWidth,
            radius
        } = this.options;

        return radius - petalWidth;
    }

    getDateTime() {
        const d = new Date();
        const data = [
            twelveHours(d), // hours
            d.getMinutes(), // minutes
            d.getSeconds() // seconds
        ];

        function twelveHours(d) {
            const hours = d.getHours();

            return hours <= 12 ? hours : hours - 12;
        }

        return data;
    }
}

const flowerClock = new FlowerClock();

setInterval(() => flowerClock.updateChart(), 1000);