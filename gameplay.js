
this.gaSettings = {
	generations: 10,
	population: 10,
	topCars: 4,
	trackLength: 50
}

window.onload = function () {

	// create a new Genetic Algorithm with a population of 10 units which will be evolving by using 4 top units
	this.GA = new GeneticAlgorithm(this.gaSettings.population, this.gaSettings.topCars);


 	// init genetic algorithm
	this.GA.reset();
	this.GA.createPopulation();


	// Loop through generations
	for (var g=1; g <= this.gaSettings.generations; g++) {
		console.log("======= GENERATION [" + g + "] ============")
		var bestCar = null, totalFitness = 0;

		// Set initial car values
		this.GA.Population.forEach(function(car){
			car.fitness = 0;
			car.dead = 0;
		})


		// Loop through random generated track segments
		for(var si = 0; si < this.gaSettings.trackLength; si++) {

			// issue a new track segment
			var track = [1,1,1];			
			track[Math.round(Math.random()*2)] = 0; // puting a zero in random place of the track. The 0 is a correct way to go, 1s are obsticles
			
			// this.console.log("track")
			this.console.log("#" + si + " segment", track)

			// Move every live car further
			this.GA.getLiveUnits().forEach(function(car){

				this.GA.activateBrain(car, track)

				paintSegment(car, track);

				// check if car collides to 1 or goes out off boundaries
				if (car.pos < 0  || car.pos >= track.length || track[car.pos] == 1) {
					car.dead = 1;

					// check if this car has best fitness at the time
					if (bestCar == null || bestCar.fitness < car.fitness) {
						bestCar = car;
					}
	
					// Accumulate for AVG fitness calculation
					totalFitness += car.fitness
				} else {
					// car has gone through succesfully, update fitness value
					car.fitness = si+1;
				}
			})

			// if all cars are dead - kill the track forEach cycle
			if (this.GA.getLiveUnits().length == 0) {
				si = this.gaSettings.trackLength;
			}
		}

		// Print totals
		var avgFitness = totalFitness / this.GA.Population.length;
		console.log("AVG fitness: " + avgFitness)

		if (bestCar != null) {
			bestCar.isWinner = true;
			console.log("Best fitness: " + bestCar.fitness)
		}

		// Evolve population ant start over
		this.GA.evolvePopulation();
		this.GA.iteration++;
	}
	
};

function paintSegment(car, segment) {
	var msg = "[" + car.index + "]: ";
	var dead = false;
	// console.log(carPos)
	segment.forEach(function(el, i) {
		if (i == car.pos) {
			if (el == 1) {
				msg += "X";
				dead = true;
			}
			else msg += "C";
		} 
		else if (el == 1) msg += "o";
		else msg += "-";
	})
	if (dead) msg += " dead";
	console.log(msg);
}